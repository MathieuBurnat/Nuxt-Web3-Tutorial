export function get_smart_contract_abi() {
  const abi = [
    {
      inputs: [
        { internalType: "string", name: "initMessage", type: "string" },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "string",
          name: "oldStr",
          type: "string",
        },
        {
          indexed: false,
          internalType: "string",
          name: "newStr",
          type: "string",
        },
      ],
      name: "UpdateMessages",
      type: "event",
    },
    {
      inputs: [],
      name: "message",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "string", name: "newMessage", type: "string" },
      ],
      name: "update",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  return abi;
}