import { CommandLineInterface } from "./cli"
import { Xdsh } from "../shell/xdsh"
import type { Dir } from "../file-system/file"

export class Terminal {
  static newTerminal(img?: Dir): { terminal: HTMLDivElement, xdsh: Xdsh } {
    let terminal = Terminal.newElement()
    let cli = CommandLineInterface.newElement()
    let xdsh = new Xdsh(new CommandLineInterface(cli), img)
    terminal.appendChild(cli)

    return { terminal, xdsh }
  }

  static newElement(): HTMLDivElement {
    let ele = document.createElement('div')
    ele.className = 'xdsh-terminal'

    return ele
  }
}