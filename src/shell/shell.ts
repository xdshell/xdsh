import { Text, File, Path, FileSystem } from './filesystem'
import { TerminalCli } from '../terminal/terminalcli'

interface Command {
  name: string
  manual: string
  exec(args: string[]): boolean
}

interface CommandSet {
  [cmdName: string]: Command
}

interface Hotkey {
  [name: string]: (event: KeyboardEvent) => void
}

interface HotkeySet {
  '+': Hotkey
  'ctrl+': Hotkey
  'alt+': Hotkey
  [name: string]: Hotkey
}

interface ErrorMsg {
  (...args: any[]): string
}

interface ErrorMsgSet {
  [errorName: string]: ErrorMsg
}

interface ShellConfig {
  user: string
  version: string
  hostname: string
  pathNumber: number
}

export class Shell {
  cli: TerminalCli
  fs: FileSystem
  cmdset: CommandSet
  hotkeySet: HotkeySet
  errorMsgSet: ErrorMsgSet
  config: ShellConfig

  constructor(cli: TerminalCli) {
    this.cli = cli
    this.fs = new FileSystem()
    this.cmdset = {}
    this.hotkeySet = {
      '+': {},
      'ctrl+': {},
      'alt+': {}
    }
    this.errorMsgSet = {
      'CommandNotFound': (cmd) => `xdsh: ${cmd}: command not found`,
      'NoSuchFileOrDirectory': (file) => `cannot access ${file}: No such file or directory`,
      'NotADirectory': (file) => `not a directory: ${file}`,
      'IsADirectory': (dir) => `${dir}: Is a directory`,
      'InvalidOption': (option) => `invalid option -- '${option}'`,
    }
    this.config = {
      user: 'root',
      version: '0.0.0',
      hostname: 'shell',
      pathNumber: 2
    }
  }

  init(image?: File) {
    // set command line interface
    // this.cli = cli

    // set image
    if (image) {
      this.fs.setImage(image)
    }

    // init config
    this.initConfig()

    // auto-complete
    this.cli.cmdline.command.addEventListener('input', () => {
      this.cli.cmdline.autoComplete.innerHTML = this.getAutoComplete()
    })

    // hotkeySet
    this.registerHotkey('Enter', (event)=>{
      event.preventDefault()

      let line = this.cli.cmdline.getLine()
      let cmd = this.cli.cmdline.getCommad()
      let args = this.parseCmd(cmd)

      this.cli.history.appendElement(line)
      this.exec(args)

      this.cli.cmdline.clear()
      this.cli.cmdline.setTime()
    });

    this.registerHotkey('Tab', (event)=>{
      event.preventDefault()

      if (this.cli.cmdline.autoComplete.innerHTML) {
        this.cli.cmdline.setCommand(
          this.cli.cmdline.getCommad() +
          this.getAutoComplete()
        )
        this.cli.cmdline.autoComplete.innerHTML = ''
        this.cli.cmdline.focus()
      }
    })

    this.registerHotkey('l', (event)=>{
      event.preventDefault()

      this.cli.history.clear()
      this.cli.cmdline.clear()
    }, true)

    this.registerHotkey('u', (event)=>{
      event.preventDefault()

      this.cli.cmdline.clear()
    }, true)

    document.addEventListener('keydown', (event) => {
      // TODO : may be better?
      if (this.cli.cmdline.command != document.activeElement) {
        return
      }

      let keyName: string = event.key

      if (event.ctrlKey) {
        if (this.hotkeySet['ctrl+'][keyName]) {
          this.hotkeySet['ctrl+'][keyName](event)
        }
      }
      else if (event.altKey) {
        if (this.hotkeySet['alt+'][keyName]) {
          this.hotkeySet['alt+'][keyName](event)
        }
      }
      else if (this.hotkeySet['+'][keyName]) {
        this.hotkeySet['+'][keyName](event)
      }
    }, false)

    // prompt
    this.setPrompt()
  }

  initConfig() {
    try {
      this.config = JSON.parse(
        (<Text>this.fs.parsePath('/usr/config')!.at(-1)!).body
      )
    }
    catch(e) {
      console.log('/usr/config :' + e)
    }

    this.setPrompt()
  }

  setPrompt() {
    let wdp = this.fs.getWorkingDirectoryPath().slice()
    let wdpNumber = this.config.pathNumber > wdp.length ? 0 : wdp.length - this.config.pathNumber

    this.cli.cmdline.setPrompt(
      `${this.config.user} ` +
      `<span style="color:#2d9bf2">
        ${this.fs.parsePathToString(<Path>wdp.slice(wdpNumber))}
      </span>` +
      `<span style="color:#ff6ac1">
         >&nbsp
      </span>`
    )
  }

  getAutoComplete(): string {
    let args: string[] = this.parseCmd(this.cli.cmdline.getCommad())

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
      return this.fs.completePath(args.at(-1)!)
    }

    return ''
  }

  parseCmd(cmd: string): string[] {
    let args: string[] = cmd.trimStart().split(/\s+/)
    return args
  }

  exec(args: string[]) {
    if (args.length == 0) {
      return true
    }
    if (args.length == 1 && args[0] == '') {
      return true
    }
    else if (this.cmdset[args[0]]) {
      if (this.cmdset[args[0]].exec(args) == false) {
        this.setErrorMsg(this.errorMsgSet['InvalidOption'](args[0]))
        return false
      }
      return true
    }

    this.setErrorMsg(this.errorMsgSet['CommandNotFound'](args[0]))
    return false
  }

  setErrorMsg(errorText: string) {
    this.cli.history.appendPassage(errorText)
  }

  registerHotkey(name: string, fn: (event: KeyboardEvent) => void, ctrl=false, alt=false) {
    if (ctrl)
      this.hotkeySet['ctrl+'][name] = fn
    else if (alt)
      this.hotkeySet['alt+'][name] = fn
    else {
      this.hotkeySet['+'][name] = fn
    }
  }
}