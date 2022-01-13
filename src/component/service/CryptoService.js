import React, { Component } from "react";
import axios from "axios";

const HOST = "http://localhost:8080";

export class CryptoService extends Component {
  constructor() {
    super();
  }

  getUserPublicKey(user) {
    const data = axios.get(HOST + "/crypto/publickey", {
      params: {
        userId: user.userId,
      },
    });

    console.log("[Response] : /crypto/publickey");
    console.log(data);

    return data;
  }

  doTransaction(encryptedTransaction) {
    const data = axios.post(HOST + "/crypto/transaction", {
      userId: encryptedTransaction.userId,
      payload: encryptedTransaction.payload,
      encAesKey: encryptedTransaction.encAesKey,
    });

    console.log("[Response] : /crypto/transaction");
    console.log(data);

    return data;
  }
}
