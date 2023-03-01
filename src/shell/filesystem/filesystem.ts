
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

  constructor() {
    this.image = {
      name: '',
      type: FileType.dir,
      body: []
    }

    this.path = [<Path>this.image]
  }

  workingDirectory(): Path {
    return this.path.at(-1)!
  }

  getFile(name: string): File | undefined {
    let wd: Path = this.workingDirectory()

    for (let file of wd.body) {
      if (file.name == name) {
        return file
      }
    }
  }

  push(file: File) {
    this.workingDirectory().body.push(file)
  }

  pop(name: string, isDir: boolean = false) {
    let wd: Path = this.workingDirectory()

    wd.body.map((file, idx, arr) => {
      if (file.name == name) {
        if (isDir == false) {
          delete arr[idx]
        }
        else if (isDir == true && file.type == FileType.dir) {
          delete arr[idx]
        }
      }
    })
  }

  walkUp() {
    if (this.path.length > 1) {
      this.path.pop()
    }
  }

  walkDown(name: string): boolean {
    let wd: Path = this.workingDirectory()

    for (let file of wd.body) {
      if (file.type == FileType.dir && file.name == name) {
        this.path.push(<Path>file)
        return true
      }
    }

    return false
  }
}