import { File, FileType, FileSystem } from './shell/filesystem/filesystem'

let fs: FileSystem = new FileSystem()

fs.push({
  name: '1.txt',
  type: FileType.text,
  body: 'hello, world'
})

fs.push({
  name: '1.dir',
  type: FileType.dir,
  body: []
})

fs.walkDown('1.dir')

fs.push({
  name: '2.dir',
  type: FileType.dir,
  body: [
    {
      name: '2.txt',
      type: FileType.text,
      body: 'hello, world'
    }
  ]
})
fs.walkDown('2.dir')
fs.pop('2.txt')
fs.walkUp()
// fs.walkUp()
// fs.walkUp()