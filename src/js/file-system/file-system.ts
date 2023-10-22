import { File, FileType, Dir, DPath, FPath } from './file'

/**
 * WD: working directory
 * cd: change directory
 */
export class FileSystem {
  private img: Dir
  private path: DPath

  constructor(img: Dir) {
    this.img = img
    this.path = [this.img]
  }

  getImg(): Dir {
    return this.img
  }

  setImg(img: Dir) {
    this.img = img
    this.path = [this.img]
  }

  getPath(): DPath {
    return this.path.slice()
  }

  setPath(path: DPath) {
    this.path = path
  }

  getWF(path: FPath): File {
    return path[path.length - 1]!
  }

  getWD(path: DPath = this.path): Dir {
    return path[path.length - 1]!
  }

  isDir(file: File) {
    return file.type == FileType.dir
  }

  isTxt(file: File) {
    return file.type == FileType.txt
  }

  isUrl(file: File) {
    return file.type == FileType.url
  }

  find(name: string, path?: FPath | DPath): File | undefined {
    let file: File = path ? path[path.length - 1]! : this.path[path!.length - 1]!

    if (this.isDir(file)) {
      for (let item of (<Dir>file).body) {
        if (item.name == name) {
          return item
        }
      }
    }
    else {
      return file
    }
  }

  append(file: File): boolean {
    if (file.name == '' || file.name == '/') {
      return false
    }

    this.getWD().body.push(file)
    return true
  }

  delete(name: string, dir: boolean = false): boolean {
    let files: File[] = this.getWD().body

    for (let idx in files) {
      if (files[idx].name == name) {
        if (dir == false) {
          files.splice(parseInt(idx), 1)
          return true
        }
        else if (dir == true && files[idx].type == FileType.dir) {
          files.splice(parseInt(idx), 1)
          return true
        }
      }
    }

    return false
  }

  parseStrToPath(pathStr: string): FPath | DPath | undefined {
    let pathStrList: string[]
    let virtualPath: DPath = this.path.slice()
    let endWithDir: boolean = false

    // ''
    if (pathStr == '') {
      return
    }
    // '/'
    else if (pathStr == '/') {
      pathStrList = ['/']
    }
    // 'user/'
    else if (pathStr[pathStr.length - 1] == '/') {
      pathStrList = pathStr.split('/')
      pathStrList.pop()
      endWithDir = true
    }
    // 'user/config'
    else {
      pathStrList = pathStr.split('/')
    }
    // '/user'
    if (pathStrList[0] == '') {
      pathStrList[0] = '/'
    }

    for (let i = 0; i < pathStrList.length; i++) {
      let fileName = pathStrList[i]

      if (fileName == '.') {
        continue
      }
      else if (fileName == '..') {
        this.cdParent(virtualPath)
      }
      else if (fileName == this.img.name) {
        this.cdRoot(virtualPath)
      }
      else if (i == pathStrList.length - 1)
      {
        let file = this.find(fileName, virtualPath)

        if (file == undefined) {
          return
        }
        else if (endWithDir && !this.isDir(file)) {
          return
        }
        else if (this.isDir(file)) {
          virtualPath.push(<Dir>file)
        }
        else {
          (<FPath>virtualPath).push(file)
          return <FPath>virtualPath
        }
      }
      else {
        if (!this.cdChild(fileName, virtualPath)) {
          return
        }
      }
    }

    return virtualPath
  }

  parsePathToStr(path: FPath | DPath): string {
    let pathStr: string = ''

    for (let idx in path) {
      if (path[idx].name == '/') {
        pathStr += path[idx].name
      }
      else if (parseInt(idx) == path.length - 1) {
        pathStr += path[idx].name
      }
      else {
        pathStr += path[idx].name + '/'
      }
    }

    return pathStr
  }

  completePath(pathStr: string): string {
    let lastIndexOfSlash = pathStr.lastIndexOf('/')
    let dPathStr: string
    let fPathStr: string

    if (lastIndexOfSlash == -1) {
      dPathStr = ''
      fPathStr = pathStr.slice()
    }
    else {
      dPathStr = pathStr.slice(0, lastIndexOfSlash)
      if (dPathStr == '') {
        dPathStr = '/'
      }
      fPathStr = pathStr.slice(lastIndexOfSlash + 1)
    }

    let virtualPath = dPathStr ? <DPath>this.parseStrToPath(dPathStr) : this.getPath()

    if (virtualPath != undefined) {
      for (let file of this.getWD(virtualPath).body) {
        if (file.name.length > fPathStr.length &&
          file.name.slice(0, fPathStr.length) == fPathStr)
        {
          let completeText = file.name.slice(fPathStr.length)
          return completeText
        }
      }
    }

    return ''
  }

  cdRoot(path: DPath = this.path) {
    path.splice(0)
    path.push(this.img)
  }

  cdParent(path: DPath = this.path) {
    if (path.length > 1) {
      path.pop()
    }
  }

  cdChild(name: string, path: DPath = this.path): boolean {
    let files: File[] = this.getWD(path).body

    for (let file of files) {
      if (this.isDir(file) && file.name == name) {
        path.push(<Dir>file)
        return true
      }
    }

    return false
  }
}