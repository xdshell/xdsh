import { Terminal } from './terminal/terminal'
import image from './image.json'

let xdshTerminal = new Terminal(
  <HTMLDivElement>document.getElementsByClassName('xdsh-terminal')[0],
  image
)
xdshTerminal.appendCli()