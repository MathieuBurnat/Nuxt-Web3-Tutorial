<template>
  <div class="p-4">
    <div v-if="!instance">
      <button @click="initWeb3">[Connect Metamask]</button>
    </div>
    <div v-else>
      <button @click="interact">[Smart Contract]</button>
      <button @click="disconnectWeb3">[Disconnect Metamask]</button>
    </div>
    <div>
      <p>Informations :</p>
      <p>Network: {{ web3.networkId }}</p>
      <p>Account: {{ web3.coinbase }}</p>
      <p>Balance: {{ web3.balance }}</p>
    </div>
    <p class="italic text-red-600">{{ errorMessage }}</p>
  </div>
</template>

<script>
import Web3 from "web3";

import { mapGetters, mapMutations } from "vuex";

export default {
  name: "Index",
  data() {
    return {
      errorMessage: "",
      instance: null,
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
    async interact() {
      // TODO : interact with smart contract
      console.log("interact");
    },
    async disconnectWeb3() {
      // TODO : disconnect Metamask
      this.instance = null;
    },
  },
};
</script>
