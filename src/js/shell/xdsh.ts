import { Shell } from "./shell"
import { FileType } from "../file-system/file"
import type { File, Dir, Txt, FPath, DPath } from "../file-system/file"
import { CommandLineInterface } from "../components/cli"
import { Divider } from "../components/divider"
import { HLayout, VLayout } from "../components/layout"

export class Xdsh extends Shell {
  constructor(cli: CommandLineInterface, img?: Dir) {
    super(
      cli,
      img ? img : {
        name: '/',
        type: FileType.dir,
        body: []
      }
    )

    this.init()
  }

  init() {
    this.initConfig()
    this.initHotkey()
    this.initCommand()

    super.init()
  }

  private initConfig() {
    try {
      this.configSet = JSON.parse(
        (<Txt>this.fs.getWF(<FPath>this.fs.parseStrToPath('/usr/config'))).body
      )
    }
    catch(e) {
      this.logError('xdsh: /usr/config not found. Using default configuration.')
    }
  }

  private initHotkey() {
    this.registerHotkey('Enter', (event)=>{
      event.preventDefault()

      // TODO: can edit
      this.cli.history.append(this.cli.cmdline.getLine())
      this.exec(this.cli.cmdline.getCommad())

      this.cli.cmdline.clear()
      this.cli.cmdline.setTime()
    });

    this.registerHotkey('Tab', (event)=>{
      event.preventDefault()

      if (this.cli.cmdline.autoComplete.innerHTML) {
        this.cli.cmdline.setCommand(
          this.cli.cmdline.getCommad() +
          this.getAutoComplete(this.cli.cmdline.getCommad())
        )
        this.cli.cmdline.autoComplete.innerHTML = ''
        this.cli.cmdline.focus()
      }
    })

    this.registerHotkey('l', (event)=>{
      event.preventDefault()

      this.cli.history.clear()
      this.cli.cmdline.clear()
    }, true)

    this.registerHotkey('u', (event)=>{
      event.preventDefault()

      this.cli.cmdline.clear()
    }, true)

    this.registerHotkey('d', (event)=>{
      event.preventDefault()

      this.cmdset['exit'].exec(['exit'])
    }, true)

    this.registerHotkey('h', (event)=>{
      event.preventDefault()

      this.cmdset['split'].exec(['split', 'h'])
    }, false, true)

    this.registerHotkey('j', (event)=>{
      event.preventDefault()

      this.cmdset['split'].exec(['split', 'j'])
    }, false, true)

    this.registerHotkey('k', (event)=>{
      event.preventDefault()

      this.cmdset['split'].exec(['split', 'k'])
    }, false, true)

    this.registerHotkey('l', (event)=>{
      event.preventDefault()

      this.cmdset['split'].exec(['split', 'l'])
    }, false, true)
  }

  private initCommand() {
    this.cmdset['help'] = {
      name: 'help',
      manual: 'Help you get familiar with xdsh command.',
      exec: (args: string[]): boolean => {
        if (args.length == 1) {
          this.cli.history.append(this.cmdset[args[0]].manual)
          return true
        }

        if (this.cmdset[args[1]]) {
          this.cli.history.append(this.cmdset[args[1]].manual)
          return true
        }

        return false
      }
    }
    this.cmdset['cmd'] = {
      name: 'cmd',
      manual: 'List all of the commands.',
      exec: (args: string[]): boolean => {
        for (let key in this.cmdset) {
          this.cli.history.append(key + ' ')
        }
        return true
      }
    }
    this.cmdset['ls'] = {
      name: 'ls',
      manual: 'List files in working directory.',
      exec: (args: string[]): boolean => {
        let files: File = this.fs.getWD()
        let getlsitem = (tagName: string, text: string, className: string): HTMLElement => {
          let item = document.createElement(tagName)
          item.innerText = text
          item.className = className

          return item
        }
        let lsDiv = document.createElement('div')
        lsDiv.className = 'xdsh-cmd__ls'

        if (args.length > 1) {
          let virtualPath = this.fs.parseStrToPath(args[1])
          if (virtualPath) {
            files = virtualPath[virtualPath.length - 1]!
          }
          else return false
        }

        if (files.type == FileType.dir) {
          for (let file of (<Dir>files).body) {
            let item: HTMLElement

            switch (file.type) {
              case FileType.dir:
                item = getlsitem('div', file.name, 'xdsh-cmd__ls-dir');
                break
              case FileType.txt:
                item = getlsitem('div', file.name, 'xdsh-cmd__ls-text');
                break
              case FileType.url:
                item = getlsitem('a', file.name, 'xdsh-cmd__ls-link');
                item.setAttribute('href', <string>file.body)
                item.setAttribute('target', '_blank')
                break
              default: return false
            }

            lsDiv.appendChild(item)
          }
        }
        else {
          lsDiv.innerHTML = <string>files.name
        }

        this.cli.history.append(lsDiv)
        return true
      }
    }
    this.cmdset['cd'] = {
      name: 'cd',
      manual: 'Change directory.',
      exec: (args: string[]): boolean => {
        if (args.length == 1) {
          this.fs.cdRoot(this.fs.getPath())
          return true
        }

        let virtualPath: FPath | DPath | undefined
        if (virtualPath = this.fs.parseStrToPath(args[1])) {
          if (this.fs.isDir(virtualPath[virtualPath.length - 1])) {
            this.fs.setPath(<DPath>virtualPath)
            return true
          }
        }

        return false
      }
    }
    this.cmdset['rm'] = {
      name: 'rm',
      manual: `Remove file one at a time. Usage: rm [File] || rm [Dir] -r`,
      exec: (args: string[]): boolean => {
        this.fs.delete(args[1], args[2] == '-r')
        return true;
      }
    }
    this.cmdset['pwd'] = {
      name: 'pwd',
      manual: 'Print working directory.',
      exec: (args: string[]): boolean => {
        this.cli.history.append(
          this.fs.parsePathToStr(this.fs.getPath())
        )
        return true
      }
    }
    this.cmdset['cat'] = {
      name: 'cat',
      manual: 'Show file content.',
      exec: (args: string[]): boolean => {
        if (args.length <= 1)
          return false

        let virtualPath = this.fs.parseStrToPath(args[1])
        
        if (virtualPath) {
          let file = virtualPath[virtualPath.length - 1]!
          if (file.type != FileType.dir) {
            this.cli.history.append(<string>file.body)
            return true
          }
        }

        return false
      }
    }
    this.cmdset['mkdir'] = {
      name: 'mkdir',
      manual: 'Make directory.',
      exec: (args: string[]): boolean => {
        if (args.length <= 1) {
          return false
        }

        let files = this.fs.getWD().body
        for (let file of files) {
          if (file.type == FileType.dir &&
            file.name == args[1])
          {
            return false
          }
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
      manual: 'Make a file. Usage: touch [FileName] [text|link|exe] [content]',
      exec: (args: string[]): boolean => {
        if (args.length <= 1) {
          return false
        }

        let type: FileType = FileType.txt
        if (args[2] == 'txt') {
          type = FileType.txt
        }
        else if (args[2] == 'url') {
          type = FileType.url
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
      manual: 'Edit file content. Usage: vim [File] [content]',
      exec: (args: string[]): boolean => {
        if (args.length <= 2) {
          return false
        }

        let virtualPath = this.fs.parseStrToPath(args[1])
        if (virtualPath) {
          let file = virtualPath[virtualPath.length - 1]!
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
      manual: 'Clear.',
      exec: (args: string[]): boolean => {
        this.cli.history.clear()
        this.cli.cmdline.clear()
        return true
      }
    }
    this.cmdset['import'] = {
      name: 'pwd',
      manual: 'Import image file. See more docs in docs.',
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
                  this.fs.setImg(img)
                  this.cli.history.append('Load successfully')
                }
              } catch(err){
                this.cli.history.append('Load failed')
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
      manual: 'Export image file. See more docs in docs.',
      exec: (args: string[]): boolean => {
        // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.fs.getImg()))
        let downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", dataStr)
        downloadAnchorNode.setAttribute("download", "image.json")
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
        
        return true;
      }
    }
    this.cmdset['split'] = {
      name: 'split',
      manual: 'Split window. Usage: split [a | d | w | s]. If you have ever played 4399, you know how to do it.\nAlso if you are a vimer... There\'s no need to say.',
      exec: (args: string[]): boolean => {
        let divider = Divider.newElement()
        let cli = CommandLineInterface.newElement()
        let parentNode = this.cli.self.parentNode!
        new Xdsh(new CommandLineInterface(cli), this.getImg())

        // split new window to the left
        if (args[1] == 'a' || args[1] == 'h') {
          let hlayout = HLayout.newElement()
          parentNode.replaceChild(hlayout, this.cli.self)

          hlayout.appendChild(cli)
          hlayout.appendChild(divider)
          hlayout.appendChild(this.cli.self)
        }
        // split new window to the right
        else if (args[1] == 'd' || args[1] == 'l') {
          let hlayout = HLayout.newElement()
          parentNode.replaceChild(hlayout, this.cli.self)

          hlayout.appendChild(this.cli.self)
          hlayout.appendChild(divider)
          hlayout.appendChild(cli)
        }
        // split new window to the top
        else if (args[1] == 'w' || args[1] == 'k') {
          let vlayout = VLayout.newElement()
          parentNode.replaceChild(vlayout, this.cli.self)

          vlayout.appendChild(cli)
          vlayout.appendChild(divider)
          vlayout.appendChild(this.cli.self)
        }
        // split new window to the bottom
        else if (args[1] == 's' || args[1] == 'j') {
          let vlayout = VLayout.newElement()
          parentNode.replaceChild(vlayout, this.cli.self)

          vlayout.appendChild(this.cli.self)
          vlayout.appendChild(divider)
          vlayout.appendChild(cli)
        }
        
        return true
      }
    }
    this.cmdset['exit'] = {
      name: 'exit',
      manual: 'Close shell.',
      exec: (args: string[]): boolean => {
        let parentNode = this.cli.self.parentNode!

        if (parentNode.childNodes.length >= 3) {
          parentNode.removeChild(parentNode.childNodes[1])
          parentNode.removeChild(this.cli.self)
          parentNode.parentNode?.replaceChild(parentNode.childNodes[0], parentNode)
        }
        else {
          parentNode.removeChild(this.cli.self)
        }

        return true
      }
    }

    // TODO
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
  }
}