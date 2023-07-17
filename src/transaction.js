let bitcoinjs = require("bitcoinjs-lib");
const varuint = require("varuint-bitcoin");

class MyTransaction extends bitcoinjs.Transaction {
  constructor() {
    super();
  }

  static fromHex(hex) {
    let tx = super.fromHex(hex);
    let myTx = new MyTransaction();

    for (let prop in tx) {
      myTx[prop] = tx[prop];
    }
    return myTx;
  }

  toTuples() {
    const tuples = [];
    this.appendTuple(tuples, this.version, "version", 4);

    if (this.hasWitnesses()) {
      this.appendTuple(tuples, MyTransaction.ADVANCED_TRANSACTION_MARKER, "marker");
      this.appendTuple(tuples, MyTransaction.ADVANCED_TRANSACTION_FLAG, "flag");
    }

    this.appendVarIntTuple(tuples, this.ins.length, "txInVarInt");
    this.ins.forEach((txIn, i) => this.processTxIn(tuples, txIn, `txIn[${i}]`));
    this.appendVarIntTuple(tuples, this.outs.length, "txOutVarInt");
    this.outs.forEach((txOut, i) => this.processTxOut(tuples, txOut, `txOut[${i}]`));
    
    if (this.hasWitnesses()) {
      this.ins.forEach((input, i) => this.processWitness(tuples, input.witness, `witness[${i}]`));
    }

    this.appendTuple(tuples, this.locktime, "locktime", 4);
    return tuples;
  }

  appendTuple(tuples, value, label, size = 1) {
    const buffer = Buffer.alloc(size);
    if (size === 1) {
      buffer.writeUInt8(value);
    } else if (size === 4) {
      buffer.writeUInt32LE(value);
    } else if (size === 8) {
      buffer.writeBigUInt64LE(BigInt(value));
    }
    tuples.push([buffer.toString("hex"), label]);
  }

  appendVarIntTuple(tuples, value, label) {
    const varInt = varuint.encode(value);
    tuples.push([varInt.toString("hex"), label]);
  }

  appendVarSlice(tuples, script, label) {
    this.appendVarIntTuple(tuples, script.length, `${label}scriptVarInt`);
    tuples.push([script.toString("hex"), `${label}script`]);
  }

  processTxIn(tuples, txIn, label) {
    tuples.push([txIn.hash.toString("hex"), `${label}hash`]);
    this.appendTuple(tuples, txIn.index, `${label}index`, 4);
    this.appendVarSlice(tuples, txIn.script, label);
    this.appendTuple(tuples, txIn.sequence, `${label}sequence`, 4);
  }

  processTxOut(tuples, txOut, label) {
    this.appendTuple(tuples, txOut.value, `${label}value`, 8);
    this.appendVarSlice(tuples, txOut.script, label);
  }

  processWitness(tuples, witness, label) {
    this.appendVarIntTuple(tuples, witness.length, `${label}VarInt`);
    witness.forEach((buf, i) => this.appendVarSlice(tuples, buf, `${label}[${i}]`));
  }
}

export default MyTransaction;