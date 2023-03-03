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

  constructor(image?: File) {
    this.image = {
      name: '/',
      type: FileType.dir,
      body: [
        {
          name: 'bin',
          type: FileType.dir,
          body: []
        }
      ]
    }

    this.path = [<Directory>this.image]
  }

  appendImage(image: File) {
    (<DirBody>this.image.body).push(image)
  }

  // execute(exe: ExecutableFile): boolean {
  //   return Function(exe.body)()
  // }

  // getExecutableFile() {

  // }

  parsePath(pathString: string): Path | undefined {
    if (pathString.length == 0) return

    let pathStringList: string[] = pathString.split('/')
    let virtualPath: Path = <Path>this.path.slice()
    let file: File | undefined

    if (pathString[0] == '/') {
      pathStringList[0] = '/'
    }
    if (pathStringList.at(-1) == '') {
      pathStringList.pop()
    }

    for (let name of pathStringList.slice(0, -1)) {
      if (name == '.') {
        continue
      }
      else if (name == '..') {
        this.cdParentDir(virtualPath)
      }
      else if (name == this.image.name) {
        this.cdRoot(virtualPath)
      }
      else if (this.cdChildDir(name, virtualPath) == false) {
        return
      }
    }

    file = this.getFile(pathStringList.at(-1)!, <Directory>virtualPath.at(-1))
    if (file == undefined) {
      return
    } else {
      virtualPath.push(file)
    }

    return virtualPath
  }

  completePath(pathString: string): string {
    let dirPathString: string = pathString.slice(0, pathString.lastIndexOf('/'))
    let fileString: string = pathString.slice(pathString.lastIndexOf('/') + 1)
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

  getFile(name: string, directory: Directory = this.getWorkingDirectory()): File | undefined {
    for (let file of directory.body) {
      if (file.name == name) {
        return file
      }
    }
  }

  append(file: File) {
    this.getWorkingDirectory().body.push(file)
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
    let files: File[] = this.getWorkingDirectory().body

    for (let file of files) {
      if (file.type == FileType.dir && file.name == name) {
        path.push(<Directory>file)
        return true
      }
    }

    return false
  }
}