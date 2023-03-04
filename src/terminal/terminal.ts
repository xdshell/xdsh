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
    this.terminal.appendChild(cli);
    (new Xdsh(new TerminalCli(cli))).init(this.image)
  }

  appendDivider() {
    this.terminal.appendChild(document.createElement('hr'))
  }

  appendChild(element: HTMLElement) {
    this.terminal.appendChild(element)
  }

  static newTerminal() {
    let terminal = document.createElement('div')
    terminal.className = 'xdsh-terminal'
    return terminal
  }

  // more infomation: https://grrr.tech/posts/create-dom-node-from-html-string/
  static newCli(): HTMLDivElement {
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