
const path = require('path')
const os = require('os')
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient('localhost', '5001', { protocol: 'http' })

export default class Ipfs {

  read(hash: string) {
    ipfs.get(hash, function (err: any, files: any) {
      files.forEach((file: string) => {
        console.log(file.path)
        console.log(file.content.toString('utf8'))
      })
    })
  }

  write() {
    const filePath = path.join(os.homedir(), `data.txt`)
    ipfs.addFromFs(filePath, (err: any, result: any) => {
      if (err) {
        throw err
      }
      console.log(result)
    })
  }

}
