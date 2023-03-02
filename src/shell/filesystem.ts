export enum FileType {
  dir, text, link, exe
}

type DirBody = Array<File>
type TextBody = string
type LinkBody = string
type ExeBody = string

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

export class FileSystem {
  image: File
  path: Directory[]

  constructor(image?: File) {
    this.image = {
      name: '/',
      type: FileType.dir,
      body: [
        {
          name: 'bin',
          type: FileType.dir,
          body: []
        },
        {
          name: 'home',
          type: FileType.dir,
          body: []
        }
      ]
    }

    this.path = [<Directory>this.image]
  }

  execute() {
    
  }

  setImage(image: File) {
    this.image = image
    this.cdRoot()
  }

  // only if path ended with dir
  checkPathStrict(pathList: string[]): boolean {
    if (pathList.length == 0) {
      return false
    }

    let path: Directory[] = []
    this.cdRoot(path)

    return this.setWorkingDirectory(pathList, path)
  }

  checkPath(pathList: string[]): boolean {
    if (pathList.length == 0) {
      return false
    }

    let path: Directory[] = []
    this.cdRoot(path)

    if (this.checkPathStrict(pathList.slice(0, -1))) {
      this.setWorkingDirectory(pathList.slice(0, -1), path)
      if (this.getFile(pathList.at(-1)!, this.getWorkingDirectory(path))) {
        return true
      }

      return false
    }

    return false
  }

  completePath(pathList: string[]): string {
    if (pathList.length == 0) {
      return ''
    }

    let path: Directory[] = []
    this.cdRoot(path)

    if (pathList.length == 1 || this.setWorkingDirectory(pathList.slice(0, -1), path)) {
      let dir: File[] = path.at(-1)!.body
      let arg: string = pathList.at(-1)!

      for (let file of dir) {
        if (file.name.length > arg.length &&
          file.name.slice(0, arg.length) == arg)
        {
          let completeText = file.name.slice(arg.length)
          return completeText
        }
      }
    }

    return ''
  }

  /**
   * call checkPath before, otherwise there's no path check
   */
  setWorkingDirectory(pathList: string[], path: Directory[] = this.path): boolean {
    for (let name of pathList) {
      if (name == '.') {
        continue
      }
      else if (name == '..') {
        this.cdParentDir(path)
      }
      else if (name == this.image.name) {
        this.cdRoot(path)
      }
      else if (this.cdChildDir(name, path) == false) {
        return false
      }
    }

    return true
  }

  getWorkingDirectory(path: Directory[] = this.path): Directory {
    return path.at(-1)!
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
    let wd: Directory = this.getWorkingDirectory()
    let files: DirBody = wd.body

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

  cdRoot(path: Directory[] = this.path) {
    path.splice(0)
    path.push(<Directory>this.image)
  }

  cdParentDir(path: Directory[] = this.path) {
    if (path.length > 1) {
      path.pop()
    }
  }

  cdChildDir(name: string, path: Directory[] = this.path): boolean {
    let wd: Directory = this.getWorkingDirectory()

    for (let file of wd.body) {
      if (file.type == FileType.dir && file.name == name) {
        path.push(<Directory>file)
        return true
      }
    }

    return false
  }
}