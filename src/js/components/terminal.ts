import { CommandLineInterface } from "./cli"
import { Xdsh } from "../shell/xdsh"
import { File } from "../filesystem/filesystem"

export class Terminal {
  static newTerminal(image?: File): HTMLDivElement {
    let terminal = Terminal.newElement()
    let cli = CommandLineInterface.newElement()
    new Xdsh(new CommandLineInterface(cli), image)
    terminal.appendChild(cli)

    return terminal
  }

  static newElement(): HTMLDivElement {
    let ele = document.createElement('div')
    ele.className = 'xdsh-terminal'

    return ele
  }
}