import { CommandLineInterface } from "./cli"
import { Xdsh } from "../shell/xdsh"
import type { Dir } from "../file-system/file"

export class Terminal {
  static newTerminal(img?: Dir): HTMLDivElement {
    let terminal = Terminal.newElement()
    let cli = CommandLineInterface.newElement()
    new Xdsh(new CommandLineInterface(cli), img)
    terminal.appendChild(cli)

    return terminal
  }

  static newElement(): HTMLDivElement {
    let ele = document.createElement('div')
    ele.className = 'xdsh-terminal'

    return ele
  }
}