<template>
  <div class="p-4">
    <div v-if="!instance">
      <button @click="initWeb3">[Connect Metamask]</button>
    </div>
    <div v-else>
      <button @click="interact('read')">[Smart Contract : READ]</button>
      <button @click="interact('write')">[Smart Contract : WRITE]</button>
      <button @click="disconnectWeb3">[Disconnect Metamask]</button>
    </div>
    <div>
      <label for="fname">Write new value</label><br />
      <input v-model="value" /><br />
    </div>
    <div>
      <p>Informations :</p>
      <p>Network: {{ web3.networkId }}</p>
      <p>Account: {{ web3.coinbase }}</p>
      <p>Balance: {{ web3.balance }}</p>
      <p>Smart Contract Message: {{ message }}</p>
    </div>
    <p class="italic text-red-600">{{ errorMessage }}</p>
  </div>
</template>

<script>
import Web3 from "web3";

import { mapGetters, mapMutations } from "vuex";
import { get_smart_contract_abi } from "../sources/smart_contract_abi";

export default {
  name: "Index",
  data() {
    return {
      errorMessage: "",
      instance: null,
      message: "",
      value: "",
    };
  },
  computed: {
    ...mapGetters("web3", ["getInstance"]),
    web3() {
      return this.getInstance;
    },
  },
  methods: {
    ...mapMutations("web3", ["registerWeb3Instance"]),
    async initWeb3() {
      // Check for web3 provider
      if (typeof window.ethereum !== "undefined") {
        try {
          // Ask to connect
          await window.ethereum.send("eth_requestAccounts");
          this.instance = new Web3(window.ethereum);
          // Get necessary info on your node
          const networkId = await this.instance.eth.net.getId();
          const coinbase = await this.instance.eth.getCoinbase();
          const balance = await this.instance.eth.getBalance(coinbase);
          // Save it to store
          this.registerWeb3Instance({
            networkId,
            coinbase,
            balance,
          });
          this.errorMessage = "";
          console.log("instance");
          console.log(this.instance.eth);
        } catch (error) {
          // User denied account access
          console.error("User denied web3 access", error);
          this.errorMessage =
            "Please connect to your Ethereum address on Metamask before connecting to this website";
          return;
        }
      }
      // No web3 provider
      else {
        console.error("No web3 provider detected");
        this.errorMessage =
          "No web3 provider detected. Did you install the Metamask extension on this browser?";
        return;
      }
    },
    async disconnectWeb3() {
      // TODO : disconnect Metamask
      this.instance = null;
    },
    async interact(action) {
      console.log("interact");

      const chainId = await this.instance.eth.getChainId();
      if (chainId != 5) {
        this.errorMessage =
          "You are not on the testnet, please change your network";
        return;
      } else {
        console.log("--- Testnet: OK ---");
      }

      const contract_address = process.env.SMART_CONTRACT_ADDRESS;
      console.log("contract_address");
      console.log(contract_address);

      const contract = new this.instance.eth.Contract(
        get_smart_contract_abi(),
        contract_address
      );

      if (action == "read") {
        console.log("======= Call smart contract -> get message ========");
        contract.methods
          .message()
          .call()
          .then((value) => {
            console.log(value);
            this.message = value;
          });
      }

      if (action == "write") {
        console.log("======= Call smart contract -> set a message ========");

        const message = this.value;
        const private_key = process.env.WALLET_PRIVATE_KEY;

        // create transaction
        const tx_builder = await contract.methods.update(message);
        const encoded_tx = await tx_builder.encodeABI();
        const transactionObject = {
          gas: 100000,
          data: encoded_tx,
          from: this.account,
          to: contract_address,
        };

        // create signed transaction
        const signedTx = await this.instance.eth.accounts.signTransaction(
          transactionObject,
          private_key
        );

        this.instance.eth.sendSignedTransaction(
          signedTx.rawTransaction,
          function (error, hash) {
            if (!error) {
              console.log(
                "🎉 The hash of your transaction is: ",
                hash,
                "\n Check Alchemy's Mempool to view the status of your transaction!"
              );
            } else {
              console.log(
                "❗Something went wrong while submitting your transaction:",
                error
              );
            }
          }
        );
      }
      /*
      // NOT WORKING
      // sign trasaction with walletconnect 2 signClient
      //const signedTx2 = await signClient.signTransaction(
      //  signedTx.rawTransaction,
      //  this._WalletConnectProvider
      //);
      */
    },
  },
};
</script>
