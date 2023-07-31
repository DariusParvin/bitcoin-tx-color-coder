const bitcoinjs = require("bitcoinjs-lib");
const ecc = require('@bitcoinerlab/secp256k1');
import { TransactionDescriptions as txDescriptions } from "./txFieldDescriptions.js";
import * as convert from './conversionHelpers.js';

// Needed for p2tr support
bitcoinjs.initEccLib(ecc);

class MyTransaction extends bitcoinjs.Transaction {
  constructor() {
    super();
  }

  static fromHex(hex) {
    const tx = super.fromHex(hex);
    Object.setPrototypeOf(tx, MyTransaction.prototype);
    return tx;
  }

  toAnnotatedData() {
    // witness transactions have a marker and flag
    if (this.hasWitnesses()) {
      return [
        ...this.getVersion(),
        ...this.getMarker(),
        ...this.getFlag(),
        ...this.getInputs(),
        ...this.getOutputs(),
        ...this.getWitnesses(),
        ...this.getLocktime(),
      ];
    }
    // legacy transactions do not have a marker or flag
    return [
      ...this.getVersion(),
      ...this.getInputs(),
      ...this.getOutputs(),
      ...this.getLocktime(),
    ];
  }

  getVersion() {
    const value = this.version;
    const hex = convert.toUInt32LE(value);
    return [[hex, "version", value, txDescriptions.version]];
  }

  getMarker() {
    const value = MyTransaction.ADVANCED_TRANSACTION_MARKER;
    const hex = convert.toUInt8(value);
    return [[hex, "marker", value, txDescriptions.marker]];
  }

  getFlag() {
    const value = MyTransaction.ADVANCED_TRANSACTION_FLAG;
    const hex = convert.toUInt8(value);
    return [[hex, "flag", value, txDescriptions.flag]];
  }

  getInputs() {
    const inputTuples = this.ins.map((_, i) => [
      ...this.getInputHash(i),
      ...this.getInputIndex(i),
      ...this.getInputScriptVarInt(i),
      ...this.getInputScript(i),
      ...this.getInputSequence(i),
    ]);

    return [...this.getInputCount(), ...inputTuples.flat()];
  }

  getInputCount() {
    const value = this.ins.length;
    const hex = convert.toVarInt(value);
    return [[hex, "txInVarInt", value, txDescriptions.txInVarInt]];
  }

  getInputHash(index) {
    const bigEndianHash = this.ins[index].hash;
    const hex = bigEndianHash.toString("hex");
    const converted = convert.Endian(bigEndianHash.toString("hex"));
    const label = `txIn[${index}]hash`;
    return [[hex, label, converted, txDescriptions.txInHash]];
  }

  getInputIndex(index) {
    const value = this.ins[index].index;
    const hex = convert.toUInt32LE(value);
    const label = `txIn[${index}]index`;
    return [[hex, label, value, txDescriptions.txInIndex]];
  }

  getInputScriptVarInt(index) {
    const value = this.ins[index].script.length;
    const hex = convert.toVarInt(value);
    const label = `txIn[${index}]scriptVarInt`;
    return [[hex, label, value, txDescriptions.txInScriptVarInt]];
  }

  getInputScript(index) {
    const value = this.ins[index].script;
    const hex = value.toString("hex");
    let decoded;
    if (hex === "") {
      decoded = "Empty script";
    } else {
      decoded = bitcoinjs.script.toASM(value);
    }
    const label = `txIn[${index}]script`;
    return [[hex, label, decoded, txDescriptions.txInScript]];
  }

  getInputSequence(index) {
    const value = this.ins[index].sequence;
    const hex = convert.toUInt32LE(value);
    const label = `txIn[${index}]sequence`;
    return [[hex, label, value, txDescriptions.txInSequence]];
  }

  getOutputs() {
    const outputTuples = this.outs.map((_, i) => [
      ...this.getOutputValue(i),
      ...this.getOutputScriptVarInt(i),
      ...this.getOutputScript(i),
    ]);

    return [...this.getOutputCount(), ...outputTuples.flat()];
  }

  getOutputCount() {
    const value = this.outs.length;
    const hex = convert.toVarInt(value);
    return [[hex, "txOutVarInt", value, txDescriptions.txOutVarInt]];
  }

  getOutputValue(index) {
    const value = this.outs[index].value;
    const hex = convert.toBigUInt64LE(value);
    const satsValue = `${value} sats`;
    const label = `txOut[${index}]value`;
    return [[hex, label, satsValue, txDescriptions.txOutValue]];
  }

  getOutputScriptVarInt(index) {
    const value = this.outs[index].script.length;
    const hex = convert.toVarInt(value);
    const label = `txOut[${index}]scriptVarInt`;
    return [[hex, label, value, txDescriptions.txOutScriptVarInt]];
  }

  getOutputScript(index) {
    const value = this.outs[index].script;
    const hex = value.toString("hex");
    const decoded = bitcoinjs.script.toASM(value);
    const addressAndDescription = this.generateOutputScriptDescriptionWithAddress(index);
    const label = `txOut[${index}]script`;
    return [[hex, label, decoded, addressAndDescription]];
  }

  getWitnesses() {
    const witnessTuples = this.ins.map((_, i) => [
      ...this.getWitnessVarInt(i),
      ...this.getWitnessStackElements(i),
    ]);

    return witnessTuples.flat();
  }

  getWitnessStackElements(index) {
    const witness = this.ins[index].witness;
    const witnessTuples = witness.map((_, i) => [
      ...this.getWitnessItemsVarInt(index, i),
      ...this.getWitnessItem(index, i),
    ]);

    return witnessTuples.flat();
  }

  getWitnessVarInt(index) {
    const value = this.ins[index].witness.length;
    const hex = convert.toVarInt(value);
    const label = `witness[${index}]VarInt`;
    return [[hex, label, value, txDescriptions.witnessVarInt]];
  }

  getWitnessItemsVarInt(index, witnessIndex) {
    const value = this.ins[index].witness[witnessIndex].length;
    const hex = convert.toVarInt(value);
    const label = `witness[${index}][${witnessIndex}]scriptVarInt`;
    return [[hex, label, value, txDescriptions.witnessItemsVarInt]];
  }

  getWitnessItem(index, witnessIndex) {
    const witnessItem = this.ins[index].witness[witnessIndex];
    const hex = witnessItem.toString("hex");
    const w = this.identifyWitnessItem(witnessItem);
    const label = `witness[${index}][${witnessIndex}]script`;
    return [[hex, label, w.decoded, w.description]];
  }

  getLocktime() {
    const value = this.locktime;
    const hex = convert.toUInt32LE(value);
    return [[hex, "locktime", value, txDescriptions.locktime]];
  }

  generateOutputScriptDescriptionWithAddress(index) {
    let description;
    try {
      const script = this.outs[index].script;
      const address = bitcoinjs.address.fromOutputScript(script);
      description = `${txDescriptions.txOutScript} This scriptPubkey is a standard type and can be encoded as the following address: ${address}`;
    } catch (error) {
      description = `${txDescriptions.txOutScript} This scriptPubKey is non-standard and therefore cannot be encoded as an address.`;
    }
    return description;
  }

  // identifyWitnessItem takes a witness item and returns a description of the item and a decoded value
  identifyWitnessItem(witnessItem) {
    let hex = witnessItem.toString("hex");
    if (hex === "") {
      return {description: txDescriptions.witnessItemEmpty, decoded: ""};
    }

    if (bitcoinjs.script.isCanonicalPubKey(witnessItem)) {
      return {description: txDescriptions.witnessItemPubkey, decoded: hex};
    }

    if (bitcoinjs.script.isCanonicalScriptSignature(witnessItem)) {
      return {description: txDescriptions.witnessItemSignature, decoded: hex};
    }

    // if the witness item is a script, decode it 
    try {
      const decodedScript = bitcoinjs.script.toASM(witnessItem);
      return {description: txDescriptions.witnessItemScript, decoded: decodedScript};
    } catch (error) {
      // not a script
    }

    // TODO: identify taproot witness items

    return {description: txDescriptions.witnessItem, decoded: hex};
  }

}

export default MyTransaction;
