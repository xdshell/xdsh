export enum FileType {
  dir, text, link
}

type DirBody = Array<File>
type TextBody = string
type LinkBody = string

export interface File {
  name: string
  type: FileType
  body: DirBody | TextBody | LinkBody
}

export interface Path extends File {
  name: string
  type: FileType.dir
  body: DirBody
}

export class FileSystem {
  image: File
  path: Path[]

  constructor(image?: File) {
    this.image = image ? image : {
      name: '/',
      type: FileType.dir,
      body: []
    }

    this.path = [<Path>this.image]
  }

  setImage(image: File) {
    this.image = image
    this.cdRoot()
  }

  checkPath(pathList: string[]): boolean {
    let path: Path[] = []
    this.cdRoot(path)

    return this.setWorkingDirectory(pathList, path)
  }

  completePath(pathList: string[]): string {
    if (pathList.length == 0) {
      return ''
    }

    let path: Path[] = []
    this.cdRoot(path)
    console.log(pathList)
    
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
  setWorkingDirectory(pathList: string[], path: Path[] = this.path): boolean {
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

  getWorkingDirectory(): Path {
    return this.path.at(-1)!
  }

  getFile(name: string): File | undefined {
    let wd: Path = this.getWorkingDirectory()

    for (let file of wd.body) {
      if (file.name == name) {
        return file
      }
    }
  }

  append(file: File) {
    this.getWorkingDirectory().body.push(file)
  }

  delete(name: string, isDir: boolean = false): boolean {
    let wd: Path = this.getWorkingDirectory()
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

  cdRoot(path: Path[] = this.path) {
    path.splice(0)
    path.push(<Path>this.image)
  }

  cdParentDir(path: Path[] = this.path) {
    if (path.length > 1) {
      path.pop()
    }
  }

  cdChildDir(name: string, path: Path[] = this.path): boolean {
    let wd: Path = this.getWorkingDirectory()

    for (let file of wd.body) {
      if (file.type == FileType.dir && file.name == name) {
        path.push(<Path>file)
        return true
      }
    }

    return false
  }
}