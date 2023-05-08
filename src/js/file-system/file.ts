export enum FileType {
  dir=0, txt, url
}

export interface File {
  name: string
  type: FileType
  body: File[] | string
}

export interface Dir extends File {
  type: FileType.dir
  body: File[]
}

export interface Txt extends File {
  type: FileType.txt
  body: string
}

export interface Url extends File {
  type: FileType.url
  body: string
}

export type DPath = [...dir: Dir[]]
export type FPath = [...dir: DPath, file: File]