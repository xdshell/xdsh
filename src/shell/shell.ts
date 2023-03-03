import { File, FileSystem } from './filesystem'
import { Terminal } from '../terminal/terminal'

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

export class Shell {
  terminal: Terminal
  fs: FileSystem
  cmdset: CommandSet
  hotkeySet: HotkeySet
  errorMsgSet: ErrorMsgSet

  constructor(terminal: Terminal) {
    this.terminal = terminal
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
  }

  init() {
    // auto-complete
    this.terminal.cmdline.command.addEventListener('input', () => {
      this.terminal.cmdline.autoComplete.innerHTML = this.getAutoComplete()
    })

    // hotkeySet
    this.registerHotkey('Enter', (event)=>{
      event.preventDefault()

      let line = this.terminal.cmdline.getLine()
      let cmd = this.terminal.cmdline.getCommad()
      let args = this.parseCmd(cmd)

      this.terminal.history.appendSentence(line)
      this.exec(args)

      this.terminal.cmdline.clear()
    });

    this.registerHotkey('Tab', (event)=>{
      event.preventDefault()

      if (this.terminal.cmdline.autoComplete.innerHTML) {
        this.terminal.cmdline.setCommand(
          this.terminal.cmdline.getCommad() +
          this.getAutoComplete()
        )
        this.terminal.cmdline.autoComplete.innerHTML = ''
        this.terminal.cmdline.focus()
      }
    })

    this.registerHotkey('l', (event)=>{
      event.preventDefault()

      this.terminal.history.clear()
      this.terminal.cmdline.clear()
    }, true)

    this.registerHotkey('u', (event)=>{
      event.preventDefault()

      this.terminal.cmdline.clear()
    }, true)

    document.addEventListener('keydown', (event) => {
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
  }

  setPrompt(text: string) {
    this.terminal.cmdline.setPrompt(text)
  }

  getAutoComplete(): string {
    let args: string[] = this.parseCmd(this.terminal.cmdline.getCommad())

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
    let args: string[] = cmd.trim().split(/\s+/)
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
    this.terminal.history.appendPassage(errorText)
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