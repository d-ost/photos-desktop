import Request from './Request'

const CryptoJS = require('crypto-js')
const fs = require('fs')
const _groupIdAesKeyFileNameMap: Record<string, string> = {}
const keysFolder = '../keys/'

// This is a hard coded data for the same of this demostration
// Eventually this would come from a smart contract publishing events which members of the thread would subscibe to
const encryptionData = {
  // string which becomes a part of AES Encryption salt generation
  // (might be derived from thread name, current timestamp, user agent etc.)
  'label_prefix': 'ETHIndia_',
  // public key to the NuCypher policy we would use for encrypting & decrypting messages
  'policy_encrypting_key': '03509d2801df06a86ebcda2cff24cdfa2d90181c80d957a8e9e508ade03d4355d9',
  // public key of the person who encrypted the message (Alice in this case)
  'alice_public_key': '0337b03794757aaf6ff81eb8db0f121a6ecb004d9a8ea9e1fa50571f92edf5ad3f',
  'encrypted_message':
    'A9UUQ7QYTpI0WFUiTcmrKDi74Qgd+JCZUVhL9cNrMmEzAq/Bn6fnog+ub1UHTXNg70JxH69XB6fty05TAy33Xr/3GhOE9qc6Vb1+OdO18h8Or0/lXZky+gTgtHQBWfHAayoClqwrWNGaIgEnH/yY7zKPcYi0SWNx4ZJX7ST/mSwImE5ffFopPVdrLDp/kggUsH8sO1MjHnIjf8rxfsu+yXpMG2cQ+AlaXum8Hh2yFedeS2/gxE5Eu57TBXdh2rgq5IurmnxETFifXpu2sLKM9d1Mg9NUcbR963xjj+qq5adaiEmRXOEfmtYSdlrGvfKfef3Z',
  // URL to one of the NuCypher nodes deployed to decrypt data
  'bob_ursula_url': 'http://127.0.0.1:4000'
}

class Encryptor {

  constructor() {}

  encryptMessage(message: any, groupId: any) {
    this.getAESKey(groupId).then(function (aesKey) {
      const encryptedMessage = CryptoJS.AES.encrypt(message, aesKey)
      // console.log(`encryptedMessage: ${encryptedMessage}`)
      return encryptedMessage
    })
  }

  decryptMessage(message: any, groupId: any): any {
    console.log('before decrypt  ', message)
    this.getAESKey(groupId).then(function (aesKey) {
      const decryptedMessage = CryptoJS.AES.decrypt(message, aesKey)
      console.log(`decryptedMessage: ${decryptedMessage.toString(CryptoJS.enc.Utf8)}`)
      return decryptedMessage.toString(CryptoJS.enc.Utf8)
    })
  }

  getAESKey(groupId: any) {
    //NOTE: At this point in time there is a limitation in Nucyper where the key can only decrpyt
    // any message only once (even if it continues to have access to the policy)
    // As a workaround we intend to preserve this decrypted key safely on the device (in ex apple key chain) where messaging would happen
    // As a small poc to this approach we would write to a file
    return new Promise((resolve) => {
      const fileName = _groupIdAesKeyFileNameMap[groupId]
      if (fileName) {
        resolve(require(fileName))
        return
      }
      const requestObject = new Request({
        apiEndpoint: encryptionData.bob_ursula_url
      })
      requestObject.post('retrieve', {
        label: `${encryptionData.label_prefix}_${groupId}`,
        policy_encrypting_key: encryptionData.policy_encrypting_key,
        alice_verifying_key: encryptionData.alice_public_key,
        message_kit: encryptionData.encrypted_message
      }).then(function (parsedResponse: any) {
        const _aesKey = parsedResponse['result']['cleartexts'][0]
        const filePath = `${keysFolder}${fileName}key_${groupId}`
        fs.writeFileSync(filePath, _aesKey)
        _groupIdAesKeyFileNameMap[groupId] = filePath
        resolve(_aesKey)
      })
    })
  }

}
const _instance = new Encryptor()
export default _instance
