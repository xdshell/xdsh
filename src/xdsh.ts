import { Shell } from "./shell/shell"
import { Terminal } from "./terminal/terminal"
import { File, FileType, DirBody } from "./shell/filesystem"

export class Xdsh extends Shell {
  constructor(terminal: Terminal) {
    super(terminal)
  }

  init(image?: File) {
    super.init(image)

    this.initCommand()
  }

  initCommand() {
    this.cmdset['help'] = {
      name: 'help',
      manual: '',
      exec: (args: string[]): boolean => {
        if (args.length == 1) {
          if (this.cmdset[args[0]]) {
            this.terminal.history.appendPassage(this.cmdset[args[0]].manual)
            return true
          }
        }

        if (this.cmdset[args[1]]) {
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
        let files: File = this.fs.getWorkingDirectory()
        let getlsitem = (tagName: string, text: string, className: string): HTMLElement => {
          let item = document.createElement(tagName)
          item.innerText = text
          item.className = className

          return item
        }
        let lsDiv = document.createElement('div')
        lsDiv.className = 'xdsh-cmd__ls'

        if (args.length > 1) {
          let virtualPath = this.fs.parsePath(args[1])
          if (virtualPath) {
            files = virtualPath.at(-1)!
          }
          else return false
        }

        if (files.type == FileType.dir) {
          for (let file of <DirBody>files.body) {
            let item: HTMLElement

            switch (file.type) {
              case FileType.dir:
                item = getlsitem('div', file.name, 'xdsh-cmd__ls-dir');
                break
              case FileType.text:
                item = getlsitem('div', file.name, 'xdsh-cmd__ls-text');
                break
              case FileType.link:
                item = getlsitem('a', file.name, 'xdsh-cmd__ls-link');
                item.setAttribute('href', <string>file.body)
                item.setAttribute('target', '_blank')
                break
              case FileType.exe:
                item = getlsitem('div', file.name, 'xdsh-cmd__ls-exe');
                break
              default: return false
            }

            lsDiv.appendChild(item)
          }
        }
        else {
          lsDiv.innerHTML = <string>files.name
        }

        this.terminal.history.appendElement(lsDiv)
        return true
      }
    }
    this.cmdset['cd'] = {
      name: 'cd',
      manual: '',
      exec: (args: string[]): boolean => {
        if (args.length == 1) {
          this.fs.cdRoot(this.fs.path)
          this.setPrompt()
          return true
        }

        if (this.fs.setWorkingDirectory(args[1])) {
          this.setPrompt()
          return true
        }

        return false
      }
    }
    this.cmdset['rm'] = {
      name: 'rm',
      manual: '',
      exec: (args: string[]): boolean => {
        this.fs.delete(args[1], args[2] == '-r')
        return true;
      }
    }
    this.cmdset['pwd'] = {
      name: 'pwd',
      manual: '',
      exec: (args: string[]): boolean => {
        this.terminal.history.appendSentence(
          this.fs.parsePathToString(
            this.fs.getWorkingDirectoryPath()
          )
        )
        return true
      }
    }
    this.cmdset['cat'] = {
      name: 'cat',
      manual: '',
      exec: (args: string[]): boolean => {
        if (args.length <= 1)
          return false

        let virtualPath = this.fs.parsePath(args[1])
        
        if (virtualPath) {
          let file = virtualPath.at(-1)!
          if (file.type != FileType.dir) {
            this.terminal.history.appendPassage(<string>file.body)
            return true
          }
        }

        return false
      }
    }
    this.cmdset['mkdir'] = {
      name: 'mkdir',
      manual: '',
      exec: (args: string[]): boolean => {
        if (args.length <= 1) {
          return false
        }

        return this.fs.append({
          name: args[1],
          type: FileType.dir,
          body: []
        })
      }
    }
    this.cmdset['touch'] = {
      name: 'touch',
      manual: '',
      exec: (args: string[]): boolean => {
        if (args.length <= 1) {
          return false
        }

        let type: FileType = FileType.text
        if (args[2] == 'text') {
          type = FileType.text
        }
        else if (args[2] == 'link') {
          type = FileType.link
        }
        else if (args[2] == 'exe') {
          type = FileType.exe
        }

        return this.fs.append({
          name: args[1],
          type: type,
          body: args[3] ? args[3] : ''
        })
      }
    }
    this.cmdset['vim'] = {
      name: 'vim',
      manual: '',
      exec: (args: string[]): boolean => {
        if (args.length <= 2) {
          return false
        }

        let virtualPath = this.fs.parsePath(args[1])
        if (virtualPath) {
          let file = virtualPath.at(-1)!
          if (file.type != FileType.dir) {
            file.body = args[2]
            return true
          }
        }

        return false
      }
    }
    this.cmdset['clear'] = {
      name: 'clear',
      manual: '',
      exec: (args: string[]): boolean => {
        this.terminal.history.clear()
        this.terminal.cmdline.clear()
        return true
      }
    }
    this.cmdset['import'] = {
      name: 'pwd',
      manual: '',
      exec: (args: string[]): boolean => {
        const fileSelector: HTMLInputElement = document.createElement('input')
        fileSelector.setAttribute('type', 'file')
        fileSelector.setAttribute('accept', '.json')
        fileSelector.addEventListener('change', (event) => {
          let reader = new FileReader()

          if (fileSelector.files != null) {
            reader.readAsText(fileSelector.files[0], 'utf-8')
            reader.onload = () => {
              try {
                if (reader.result) {
                  let img = JSON.parse(reader.result.toString())
                  this.fs.setImage(img)
                  this.terminal.history.appendSentence('Load successfully')
                }
              } catch(err){
                this.terminal.history.appendSentence('Load failed')
                console.error(err)
              }
            }
          }
        });
        fileSelector.click();

        return true
      }
    }
    this.cmdset['export'] = {
      name: 'export',
      manual: '',
      exec: (args: string[]): boolean => {
        // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.fs.image))
        let downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", dataStr)
        downloadAnchorNode.setAttribute("download", "image.json")
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
        
        return true;
      }
    }
    this.cmdset['lisp'] = {
      name: 'lisp',
      manual: 'Building...',
      exec: (args: string[]): boolean => {
        return true
      }
    }
    this.cmdset['card'] = {
      name: 'card',
      manual: 'Building...',
      exec: (args: string[]): boolean => {
        return true
      }
    }

    // command end
  }
}