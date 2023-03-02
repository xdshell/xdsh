import { Shell } from "./shell/shell"
import { Terminal } from "./terminal/terminal"
import { File, FileType, Directory } from "./shell/filesystem"

export class Xdsh extends Shell {
  constructor(terminal: Terminal) {
    super(terminal)
  }

  init() {
    super.init()

    this.cmdset['help'] = {
      name: 'help',
      manual: '',
      exec: (args: string[]): boolean => {
        if (args.length == 1) {
          this.terminal.history.appendPassage(this.cmdset[args[0]].manual)
          return true
        }

        if (this.cmdset[args[0]]) {
          this.terminal.history.appendPassage(this.cmdset[args[1]].manual)
          return true
        }

        return false
      }
    }

    this.cmdset['ls'] = {
      name: 'ls',
      manual: '',
      exec: (args: string[]): boolean => {
        let file: Directory = this.fs.getWorkingDirectory()
        let valid = true

        if (args.length > 1) {
          let pathList: string[] = this.pathParse(args[1])
          let path: Directory[] = []
          this.fs.cdRoot(path)

          if (this.fs.checkPath(pathList)) {
            this.fs.setWorkingDirectory(pathList, path)
            file = this.fs.getWorkingDirectory(path)
          }
          else {
            valid = false
          }
        }

        if (valid) {
          let getlsitem = (tagName: string, text: string, className: string): HTMLElement => {
            let item = document.createElement(tagName)
            item.innerText = text
            item.className = className

            return item
          }
          let lsDiv = document.createElement('div')
          lsDiv.className = 'xdsh-cmd__ls'

          for (let f of file.body) {
            let item: HTMLElement

            switch (f.type) {
              case FileType.dir:
                item = getlsitem('div', f.name, 'xdsh-cmd__ls-dir');
                break
              case FileType.text:
                item = getlsitem('div', f.name, 'xdsh-cmd__ls-text');
                break
              case FileType.link: item = getlsitem('a', f.name, 'xdsh-cmd__ls-link'); break
              default: return false
            }

            lsDiv.appendChild
          }
        }

        return false
      }
    }
  }
}