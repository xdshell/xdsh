import { Terminal } from './src/js/components/terminal'
import img from './img.json'

let content = <HTMLDivElement>document.getElementsByClassName('content')[0]
let terminal = Terminal.newTerminal(img)

content.appendChild(terminal)