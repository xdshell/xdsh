import { FileType } from './shell/filesystem'
import { Shell } from './shell/shell'
import { Terminal } from './terminal/terminal'

let terminal: Terminal = new Terminal(<HTMLDivElement>document.getElementsByClassName('xdsh-terminal')[0])
let shell: Shell = new Shell(terminal)
shell.init()

shell.fs.image =
{
  name: '/',
  type: FileType.dir,
  body: [
    {
      name: '1.txt',
      type: FileType.text,
      body: '1'
    },
    {
      name: '2.txt',
      type: FileType.text,
      body: '2'
    },
    {
      name: 'insorker',
      type: FileType.dir,
      body: [

      ]
    },
  ]
}