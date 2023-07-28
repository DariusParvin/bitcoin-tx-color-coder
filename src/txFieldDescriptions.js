export const TransactionDescriptions = {
    version: "This is a 4-byte little-endian integer, representing the transaction version",
    marker: "This is a one-byte marker (required to be \'00\') that serves as an indicator that the given transaction incorporates Segregated Witness (segwit) data.",
    flag: "A one-byte flag that follows the marker in transactions with witness data. It must be non-zero. It can be interpreted as a bitvector, with the unused bits available for future extensibility for other types of witness data.",
    txInVarInt: "This is a variable integer (VarInt) that denotes the number of subsequent transaction inputs.",
    txInHash: "This is the hash of the transaction input. Note that the transaction hash here is in big-endian format, whereas in other places it is typically represented in little-endian format.",
    txInIndex: "This is a 4-byte little-endian integer which represents the index of the specific output in the previous transaction.",
    txInScriptVarInt: "This is a variable integer (VarInt) that denotes the length of the subsequent unlocking script.",
    txInScript: "This is the unlocking script (scriptSig), providing proof of ownership of the bitcoins being spent.",
    txInSequence: "This is a 4-byte little-endian number that specifies the relative locktime of the transaction input.",
    txOutVarInt: "This is a variable integer (VarInt) that denotes the number of subsequent transaction outputs.",
    txOutValue: "This is an 8-byte little-endian number that represents the amount of bitcoin to be sent in satoshis.",
    txOutScriptVarInt: "This is a variable integer (VarInt) that denotes the length (in bytes) of the subsequent locking script.",
    txOutScript: "This is the locking script (scriptPubKey), specifying the conditions under which the output can be spent.",
    witnessVarInt: "This is a variable integer (VarInt) that indicates the number of witness items for the transaction input. Note that each segwit input has its own witnessVarInt. The order of the witness items is the same as the order of the transaction inputs.",
    witnessItemsVarInt: "This is a variable integer (VarInt) that denotes the length (in bytes) of the subsequent witness item.",
    witnessItem: "This is a witness item.",
    locktime: "This is a 4-byte little-endian number that specifies the absolute locktime of the transaction."
  };
  