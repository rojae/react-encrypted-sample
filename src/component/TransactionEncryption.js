import React, { Component } from "react";
import CryptoJS from "crypto-js";
import JSEncrypt from "jsencrypt";
import { CryptoService } from "./service/CryptoService";
//import other components here

export class TransactionEncryption extends Component {
  constructor() {
    super();
    this.cryptoservice = new CryptoService();
    this.user = { userId: "d41cd772-cb57-412c-a864-6e40b2bd3e12" };
    this.state = {
      type: "payment",
      amount: 100,
      number: "123-456-789-000",
      securityCode: "123",
      log: "",
    };
  }

  doTransaction = () => {
    this.cryptoservice
      .getUserPublicKey(this.user)
      .then((resUser) => {
        console.log("RSA public key[base64]: " + resUser.data.rsaPublicKey);

        let transaction = {
          userId: this.user.userId,
          type: this.state.type,
          amount: this.state.amount,
          creditCard: {
            number: this.state.number,
            securityCode: this.state.securityCode,
          },
        };

        //generate AES key
        var secretPhrase = CryptoJS.lib.WordArray.random(16);
        var salt = CryptoJS.lib.WordArray.random(128 / 8);
        //aes key 128 bits (16 bytes) long
        var aesKey = CryptoJS.PBKDF2(secretPhrase.toString(), salt, {
          keySize: 128 / 32,
        });
        //initialization vector - 1st 16 chars of userId
        var iv = CryptoJS.enc.Utf8.parse(this.user.userId.slice(0, 16));
        var aesOptions = {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
          iv: iv,
        };
        var aesEncTrans = CryptoJS.AES.encrypt(
          JSON.stringify(transaction),
          aesKey,
          aesOptions
        );

        console.log(`Transaction: ${JSON.stringify(transaction)}`);
        console.log(
          "AES encrypted transaction [Base64]: " + aesEncTrans.toString()
        );
        console.log("AES key [hex]: " + aesEncTrans.key);
        console.log("AES init vector [hex]: " + aesEncTrans.iv);

        //encrypt AES key with RSA public key
        var rsaEncrypt = new JSEncrypt();
        rsaEncrypt.setPublicKey(resUser.data.rsaPublicKey);
        var rsaEncryptedAesKey = rsaEncrypt.encrypt(aesEncTrans.key.toString());
        console.log("RSA encrypted AES key [base64]: " + rsaEncryptedAesKey);

        var encryptedTransaction = {
          userId: this.user.userId,
          payload: aesEncTrans.toString(),
          encAesKey: rsaEncryptedAesKey,
        };

        var result = this.cryptoservice.doTransaction(encryptedTransaction);
        //showInfoMessage(this, "System", "Secure transaction completed.");
        console.log(this, "System", "Secure transaction completed.");
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  render() {
    return (
      <div>
        <p>
          1. 클라이언트는 트랜잭션을 위한 데이터를 준비한 다음 서버에 RSA 공개
          키를 요청합니다. <br></br>
          2. 서버는 RSA 키 쌍(공개 및 개인 키)을 생성하고 RSA 공개 키를
          클라이언트와 공유합니다. <br></br>
          3. 클라이언트는 AES 비밀 키를 생성하고 거래를 암호화합니다. <br></br>
          4. 클라이언트는 RSA 공개 키로 AES 비밀 키를 암호화하고, <br></br>
          5. 클라이언트는 AES 암호화된 트랜잭션과 RSA 암호화된 비밀 키를 서버에
          보내고, <br></br>
          6. 서버는 RSA 개인 키로 AES 비밀 키를 해독하고, <br></br>
          7. 서버는 복호화된 AES 비밀 키를 사용하여 트랜잭션을 복호화합니다.
        </p>
        <button onClick={this.doTransaction}>button</button>
      </div>
    );
  }
}
