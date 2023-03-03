export enum FileType {
  dir, text, link, exe
}

type DirBody = Array<File>
type TextBody = string
type LinkBody = string
type ExeBody = string
type Path = [...directory: Directory[], file: File]

export interface File {
  name: string
  type: FileType
  body: DirBody | TextBody | LinkBody | ExeBody
}

export interface Directory extends File {
  name: string
  type: FileType.dir
  body: DirBody
}

export interface ExecutableFile extends File {
  name: string
  type: FileType.exe
  body: string
} 

export class FileSystem {
  image: File
  path: Path
  private exePath: Path

  constructor(image?: File) {
    this.image = {
      name: '/',
      type: FileType.dir,
      body: [
        {
          name: 'usr',
          type: FileType.dir,
          body: [
            {
              name: 'bin',
              type: FileType.dir,
              body: []
            },
            {
              name: 'local',
              type: FileType.dir,
              body: [
                {
                  name: 'bin',
                  type: FileType.dir,
                  body: []
                }
              ]
            }
          ]
        }
      ]
    }

    this.path = [<Directory>this.image]
    this.exePath = [
      <Directory>this.parsePath('/usr/bin')?.at(-1),
      <Directory>this.parsePath('/usr/local/bin')?.at(-1)
    ]
  }

  execute(exe: ExecutableFile): boolean {
    return Function(exe.body)()
  }

  getFile(name: string, directory: Directory = this.getWorkingDirectory()): File | undefined {
    for (let file of directory.body) {
      if (file.name == name) {
        return file
      }
    }
  }

  getExecutableFile(): ExecutableFile[] {
    let exeFiles: ExecutableFile[] = []

    for (let exeDirectory of this.exePath) {
      for (let file of (<Directory>exeDirectory).body) {
        if (file.type == FileType.exe) {
          exeFiles.push(<ExecutableFile>file)
        }
      }
    }

    return exeFiles
  }

  parsePath(pathString: string): Path | undefined {
    let pathStringList: string[] =
      pathString == '/' ? ['/'] : pathString.split('/')
    let virtualPath: Path = <Path>this.path.slice()
    let file: File | undefined

    if (pathString.length == 0) {
      return virtualPath
    }
    if (pathString[0] == '/') {
      pathStringList[0] = '/'
    }

    for (let i = 0; i < pathStringList.length; i++) {
      let fileName = pathStringList[i]

      if (fileName == '.') {
        continue
      }
      else if (fileName == '..') {
        this.cdParentDir(virtualPath)
      }
      else if (fileName == this.image.name) {
        this.cdRoot(virtualPath)
      }
      else if (i != pathStringList.length - 1 &&
        this.cdChildDir(fileName, virtualPath) == false)
      {
        return
      }
      else if (i == pathStringList.length - 1) {
        file = this.getFile(pathStringList[i], <Directory>virtualPath.at(-1))
        if (file == undefined) {
          return
        } else {
          virtualPath.push(file)
        }
      }
    }

    return virtualPath
  }

  completePath(pathString: string): string {
    let lastIndexOfSlash = pathString.lastIndexOf('/')
    let dirPathString: string
    let fileString: string

    if (lastIndexOfSlash == -1) {
      dirPathString = ''
      fileString = pathString.slice()
    }
    else {
      dirPathString = pathString.slice(0, lastIndexOfSlash)
      if (dirPathString == '') {
        dirPathString = '/'
      }
      fileString = pathString.slice(lastIndexOfSlash + 1)
    }

    let virtualPath = this.parsePath(dirPathString)
    if (virtualPath != undefined) {
      for (let file of (<Directory>virtualPath.at(-1)).body) {
        if (file.name.length > fileString.length &&
          file.name.slice(0, fileString.length) == fileString)
        {
          let completeText = file.name.slice(fileString.length)
          return completeText
        }
      }
    }

    return ''
  }

  setWorkingDirectory(pathString: string, path: Path = this.path): boolean {
    let virtualPath = this.parsePath(pathString)

    if (virtualPath) {
      path = virtualPath
      return true
    }

    return false
  }

  getWorkingDirectory(path: Path = this.path): Directory {
    return <Directory>path.at(-1)!
  }

  append(file: File): boolean {
    if (file.name == '' || file.name == '/') {
      return false
    }

    this.getWorkingDirectory().body.push(file)
    return true
  }

  delete(name: string, isDir: boolean = false): boolean {
    let files: DirBody = this.getWorkingDirectory().body

    for (let idx in files) {
      if (files[idx].name == name) {
        if (isDir == false) {
          files.splice(parseInt(idx), 1)
          return true
        }
        else if (isDir == true && files[idx].type == FileType.dir) {
          files.splice(parseInt(idx), 1)
          return true
        }
      }
    }

    return false
  }

  cdRoot(path: Path = this.path) {
    path.splice(0)
    path.push(<Directory>this.image)
  }

  cdParentDir(path: Path = this.path) {
    if (path.length > 1) {
      path.pop()
    }
  }

  cdChildDir(name: string, path: Path = this.path): boolean {
    let files: File[] = (<Directory>path.at(-1))!.body

    for (let file of files) {
      if (file.type == FileType.dir && file.name == name) {
        path.push(<Directory>file)
        return true
      }
    }

    return false
  }
}