import { FileSystem } from './filesystem'
import { Terminal } from '../terminal/terminal'

interface Command {
  name: string
  manual: string
  exec(args: string[]): void
}

interface CommandSet {
  [cmdName: string]: Command
}

interface Hotkey {
  name?: (event: KeyboardEvent) => void
}

interface HotkeySet {
  'ctrl+': Hotkey
  'alt+': Hotkey
  name?: (event: KeyboardEvent) => void
}

// TODO: more error
enum ShellError {
  name='fsd'
}

export class Shell {
  terminal: Terminal
  fs: FileSystem
  cmdset: CommandSet
  hotkey: HotkeySet

  constructor(terminal: Terminal) {
    this.terminal = terminal
    this.fs = new FileSystem()
    this.cmdset = {}
    this.hotkey = {
      'ctrl+': {},
      'alt+': {}
    }
  }

  init() {
    this.terminal.cmdline.command.addEventListener('input', () => {
      this.terminal.cmdline.autoComplete.innerHTML = this.getAutoComplete()
    })
  }

  setPrompt(text: string) {
    this.terminal.cmdline.setPrompt(text)
  }

  getAutoComplete(): string {
    let args: string[] = this.cmdParse(this.terminal.cmdline.getCommad())

    if (args.length == 1) {
      for (let cmd in this.cmdset) {
        if (cmd.length > args[0].length &&
          cmd.slice(0, args[0].length) == args[0])
        {
          let completeText = cmd.slice(args[0].length)
          return completeText
        }
      }
    }
    else if (args.length > 1) {
      return this.fs.completePath(this.pathParse(args.at(-1)!))
    }

    return ''
  }

  pathParse(path: string): string[] {
    if (path.length == 0) {
      return [ '' ]
    }

    let pathList: string[] = path.split('/')
    if (path[0] == '/') {
      pathList[0] = '/'
    }
    if (pathList.at(-1) == '') {
      pathList.pop()
    }

    return pathList
  }

  cmdParse(cmd: string): string[] {
    let args: string[] = cmd.split(/\s+/)
    return args
  }

  exec(cmd: string, args: string[]) {
    if (this.cmdset[cmd]) {
      this.cmdset[cmd].exec(args)
      return true
    }

    return false
  }

  error(err: ShellError) {
    this.terminal.history.appendPassage(err)
  }

  registerHotkey(name: string, func: (event: KeyboardEvent) => void, ctrl=false, alt=false) {
    if (ctrl)
      this.hotkey['ctrl+'].name = func;
    else if (alt)
      this.hotkey['alt+'].name = func;
    else
      this.hotkey.name = func;
  }
}