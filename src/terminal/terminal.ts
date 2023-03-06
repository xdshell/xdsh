import { TerminalCli } from "./terminalcli"
import { Xdsh } from "../shell/xdsh"
import { File } from "../shell/filesystem"

export class Terminal {
  terminal: HTMLDivElement
  image: File
  static cliCount: number = 0

  constructor(terminal: HTMLDivElement, image: File) {
    this.terminal = terminal
    this.image = image
  }

  appendCli() {
    let cli = Terminal.newCli()
    this.terminal.appendChild(cli)
    
    let xdsh = new Xdsh(new TerminalCli(cli))
    xdsh.init(this.image)
  }

  // appendDivider() {
  //   this.terminal.appendChild(document.createElement('hr'))
  // }

  appendChild(element: HTMLElement) {
    this.terminal.appendChild(element)
  }

  static newTerminal() {
    let terminal = document.createElement('div')
    terminal.className = 'xdsh-terminal'
    return terminal
  }

  static newSplit() {
    let split = document.createElement('div')
    return split
  }
  
  static newDivider() {
    let divider = document.createElement('hr')
    divider.className = 'xdsh-divider'
    return divider
  }

  static newSplitRow() {
    let split = Terminal.newSplit()
    split.className = 'xdsh-split__row'
    return split
  }

  static newSplitColumn() {
    let split = Terminal.newSplit()
    split.className = 'xdsh-split__column'
    return split
  }

  static newSplitRowLeft(xdsh: Xdsh) {
    let split = Terminal.newSplitRow()
    let newCli = Terminal.newCli()
    xdsh.cli.cli.parentNode?.replaceChild(split, xdsh.cli.cli);
    (new Xdsh(new TerminalCli(newCli))).init(xdsh.getImage())

    split.appendChild(newCli)
    split.appendChild(Terminal.newDivider())
    split.appendChild(xdsh.cli.cli)
    return split
  }

  static newSplitRowRight(xdsh: Xdsh) {
    let split = Terminal.newSplitRow()
    let newCli = Terminal.newCli()
    xdsh.cli.cli.parentNode?.replaceChild(split, xdsh.cli.cli);
    (new Xdsh(new TerminalCli(newCli))).init(xdsh.getImage())

    split.appendChild(xdsh.cli.cli)
    split.appendChild(Terminal.newDivider())
    split.appendChild(newCli)
    return split
  }

  static newSplitColumnUp(xdsh: Xdsh) {
    let split = Terminal.newSplitColumn()
    let newCli = Terminal.newCli()
    xdsh.cli.cli.parentNode?.replaceChild(split, xdsh.cli.cli);
    (new Xdsh(new TerminalCli(newCli))).init(xdsh.getImage())

    split.appendChild(newCli)
    split.appendChild(Terminal.newDivider())
    split.appendChild(xdsh.cli.cli)
    return split
  }

  static newSplitColumnDown(xdsh: Xdsh) {
    let split = Terminal.newSplitColumn()
    let newCli = Terminal.newCli()
    xdsh.cli.cli.parentNode?.replaceChild(split, xdsh.cli.cli);
    (new Xdsh(new TerminalCli(newCli))).init(xdsh.getImage())

    split.appendChild(xdsh.cli.cli)
    split.appendChild(Terminal.newDivider())
    split.appendChild(newCli)
    return split
  }

  // static new

  // more infomation: https://grrr.tech/posts/create-dom-node-from-html-string/
  static newCli() {
    let cli = document.createElement('div')
    cli.className = 'xdsh-cli'
    cli.setAttribute('ID-cli', (Terminal.cliCount++).toString())
    cli.innerHTML = `
      <div class="xdsh-history"></div>
      <div class="xdsh-cmdline">
        <span class="xdsh-cmdline__prompt"></span>
        <span class="xdsh-cmdline__command" contenteditable tabindex="1"></span>
        <span class="xdsh-cmdline__auto-complete"></span>
        <span class="xdsh-cmdline__time"></span>
      </div>`

    return cli
  }
}