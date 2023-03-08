import { File, Path, FileSystem } from './filesystem'
import { CommandLineInterface } from '../components/cli'

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

interface ConfigSet {
  user: string
  version: string
  hostname: string
  wdpathLength: number
}

interface ErrorMsg {
  (...args: any[]): string
}

interface ErrorMsgSet {
  [errorName: string]: ErrorMsg
}

export class Shell {
  cli: CommandLineInterface
  fs: FileSystem
  cmdset: CommandSet
  hotkeySet: HotkeySet
  configSet: ConfigSet
  errorMsgSet: ErrorMsgSet
  errorLogSet: string[]

  constructor(cli: CommandLineInterface) {
    this.cli = cli
    this.fs = new FileSystem()
    this.cmdset = {}
    this.hotkeySet = {
      '+': {},
      'ctrl+': {},
      'alt+': {}
    }
    this.configSet = {
      user: 'root',
      version: '0.0.0',
      hostname: 'shell',
      wdpathLength: 2
    }
    this.errorMsgSet = {
      'CommandNotFound': (cmd: string) => `xdsh: ${cmd}: command not found`,
      'InvalidArguments': (args: string[]) => `xdsh: invalid arguments -- '${args}'`,
    }
    this.errorLogSet = new Array<string>()
  }

  init() {
    // auto-complete
    this.cli.cmdline.command.addEventListener('input', () => {
      this.cli.cmdline.autoComplete.innerHTML = this.getAutoComplete(
        this.cli.cmdline.getCommad()
      )
    })

    // hotkeys
    this.cli.cmdline.command.addEventListener('keydown', (event) => {
      let keyName: string = event.key
      let keyPressed: boolean = false

      if (event.ctrlKey) {
        if (this.hotkeySet['ctrl+'][keyName]) {
          this.hotkeySet['ctrl+'][keyName](event)
          keyPressed = true
        }
      }
      else if (event.altKey) {
        if (this.hotkeySet['alt+'][keyName]) {
          this.hotkeySet['alt+'][keyName](event)
          keyPressed = true
        }
      }
      else if (this.hotkeySet['+'][keyName]) {
        this.hotkeySet['+'][keyName](event)
        keyPressed = true
      }

      // log errors whenever key pressed
      if (keyPressed) {
        if (this.errorLogSet.length) {
          for (let errorLog of this.errorLogSet) {
            this.cli.history.append(errorLog)
          }
          this.errorLogSet.splice(0, this.errorLogSet.length)
        }
      }
    }, false)

    // prompt
    this.cli.cmdline.setPrompt(this.getPrompt())
  }

  getImage(): File {
    return this.fs.getImage()
  }

  setImage(image: File) {
    this.fs.setImage(image)
  }

  // return prompt html text
  protected getPrompt(): string {
    let wdpath = this.fs.getWorkingDirectoryPath().slice()
    let wdpathLength = this.configSet.wdpathLength > wdpath.length ?
      0 : wdpath.length - this.configSet.wdpathLength
    let wdpathPrompt = this.fs.parsePathToString(<Path>wdpath.slice(wdpathLength))
    if (wdpathLength > 2) {
      wdpathPrompt = '../' + wdpathPrompt
    }
    let userPrompt = this.configSet.user

    return `<span class="xdsh-cmdline__prompt-user">${userPrompt}&nbsp</span>`
      + `<span class="xdsh-cmdline__prompt-wdpath">${wdpathPrompt}&nbsp</span>`
      + `<span class="xdsh-cmdline__prompt-output">>&nbsp</span>`
  }

  // return last argument's complete
  protected getAutoComplete(cmd: string): string {
    let args: string[] = this.parseCmd(cmd)

    // empty string auto-complete
    if (args.at(-1)! == '') {
      return ''
    }
    // cmd auto-complete
    else if (args.length == 1) {
      for (let cmd in this.cmdset) {
        if (cmd.length > args[0].length
          && cmd.slice(0, args[0].length) == args[0])
        {
          let completeText = cmd.slice(args[0].length)
          return completeText
        }
      }
    }
    // path auto-complete
    else if (args.length > 1) {
      let completeText = this.fs.completePath(args.at(-1)!)
      return completeText
    }

    return ''
  }

  // log error
  protected logError(errorLog: string) {
    this.errorLogSet.push(errorLog)
  }

  protected registerHotkey(name: string, fn: (event: KeyboardEvent) => void, ctrl=false, alt=false) {
    if (ctrl)
      this.hotkeySet['ctrl+'][name] = fn
    else if (alt)
      this.hotkeySet['alt+'][name] = fn
    else {
      this.hotkeySet['+'][name] = fn
    }
  }

  protected exec(cmd: string): boolean {
    let args: string[] = this.parseCmd(cmd)

    if (args[0] == '') {
      return true
    }
    else if (this.cmdset[args[0]]) {
      if (this.cmdset[args[0]].exec(args) == false) {
        this.logError(this.errorMsgSet['InvalidArguments'](args))
        return false
      }
      return true
    }

    this.logError(this.errorMsgSet['CommandNotFound'](args[0]))
    return false
  }

  private parseCmd(cmd: string): string[] {
    let args: string[] = cmd.trimStart().split(/\s+/)
    return args
  }
}