import { Terminal } from './js/components/terminal'
import image from './image.json'

let content = <HTMLDivElement>document.getElementsByClassName('content')[0]
let terminal = Terminal.newTerminal(image)

content.appendChild(terminal)