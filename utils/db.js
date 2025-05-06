import { MMKVLoader } from "react-native-mmkv-storage";

  ///////////////////////////////////////////DB init
  //const MMKVwithID = new MMKVLoader()
  //.withInstanceID("mmkvWithID")
  //.initialize();
  
  //await MMKVwithID.setStringAsync("string", "string");

  //let string = await MMKVwithID.getStringAsync("string");  

  //const MMKVwithEncryption = new MMKVLoader()
  //.withEncryption()
  //.initialize();

  // OR if you are initializing with an instance ID

  //const MMKVwithEncryptionAndID = new MMKVLoader()
  //.withInstanceID("mmkvWithEncryptionAndID")
  //.withEncryption()
  //.initialize();

  //While the library can handle the encryption itself, you can choose to provide your own custom encryption key etc. For example, you maybe want to encrypt the storage with a token or user password.

  //const MMKVwithEncryptionKey = new MMKVLoader()
  //.withEncryption()
  //.encryptWithCustomKey("encryptionKey")
  //.initialize();
  //And if you want to store this key in secure storage.

  //const MMKVwithEncryptionKey = new MMKVLoader()
  //.withEncryption()
  //.encryptWithCustomKey("encryptionKey",true)
  //.initialize();
  //If you want to set your own custom alias for the key that is stored in the secure storage you can set it also.

  //const MMKVwithEncryptionKey = new MMKVLoader()
  //.withEncryption()
  //.encryptWithCustomKey("encryptionKey", true, "myCustomAlias")
  //.initialize();


  // isso vem do servidor via REST API aqui tem de ter os ingredientes, foto  e o modo de preparo.
  // nas Views temos de recodificar o acesso aos dados. 

    
     module.exports.MMKV = new MMKVLoader().
    .withInstanceID('mmkvInstanceID')
    .setProcessingMode(MMKVStorage.MODES.MULTI_PROCESS)
    .withEncryption()
    .encryptWithCustomKey('encryptionKey',true, 'customAlias')
    .initialize()

    // then use it


      //await MMKV.setStringAsync("string", "string");

      //let string = await MMKV.getStringAsync("string");



