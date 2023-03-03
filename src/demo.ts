import { Xdsh } from './xdsh'
import { Terminal } from './terminal/terminal'
import image from './image.json'

let terminal: Terminal = new Terminal(<HTMLDivElement>document.getElementsByClassName('xdsh-terminal')[0])
let xdsh: Xdsh = new Xdsh(terminal)
xdsh.init(image)