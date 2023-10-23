import { Terminal } from './src/js/components/terminal'
import img from './img.json'

let content = <HTMLDivElement>document.getElementsByClassName('content')[0]
let { terminal, xdsh } = Terminal.newTerminal(img)

xdsh.registerCmd({
  name: 'test',
  manual: 'test',
  exec: (args: string[]): boolean => {
    xdsh.cli.history.append('test')
    return true
  }
})

xdsh.registerHotkey('m', (event)=>{
  event.preventDefault()

  xdsh.cli.history.append('ctrl+m')
}, true)

content.appendChild(terminal)