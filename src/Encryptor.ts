const CryptoJS = require('crypto-js')

class Encryptor {

  private aesKey: string

  constructor() {
    this.aesKey = 'This is a aes salt key'
  }

  encryptMessage(message: any) {
    const encryptedMessage = CryptoJS.AES.encrypt(message, this.aesKey)
    // console.log(`encryptedMessage: ${encryptedMessage}`)
    return encryptedMessage
  }

  decryptMessage(message: any) {
    console.log('before decrypt  ', message);
    const decryptedMessage = CryptoJS.AES.decrypt(message, this.aesKey);
    console.log(`decryptedMessage: ${decryptedMessage.toString(CryptoJS.enc.Utf8)}`)
    return decryptedMessage.toString(CryptoJS.enc.Utf8);

  }

  // getAESKey() {
  //   //@Puneet/@Sarvesh:
  //   //Please get the encrypted key from nucypher.
  //   //And resolve the promise here.
  //   //Below is a dummy promise.
  //
  //   return new Promise((resolve) => {
  //     setTimeout(()=>{
  //       return aesKey;
  //     }, 1000);
  //   })
  // }

  // encryptMessage(message) {
  //   this.getAESKey().then((currentAesKey)=>{
  //     return CryptoJS.AES.encrypt(message, currentAesKey);
  //   });
  // }
  //
  // decryptMessage( message ) {
  //   this.getAESKey().then((currentAesKey)=>{
  //     return CryptoJS.AES.decrypt(message, currentAesKey);
  //   });
  // }

}
const _instance = new Encryptor()
export default _instance
