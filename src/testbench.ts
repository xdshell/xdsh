import { FileType } from './shell/filesystem'
import { Shell } from './shell/shell'
import { Terminal } from './terminal/terminal'

let terminal: Terminal = new Terminal(<HTMLDivElement>document.getElementsByClassName('xdsh-terminal')[0])
let shell: Shell = new Shell(terminal)
shell.init()