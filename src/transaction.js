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

  toAnnotatedTuples() {
    const tuples = this.toTuples();
    const annotatedTuples = tuples.map((tuple) => {
      const description = this.generateDescription(tuple);
      return [...tuple, ...description]; // Create a new tuple with the added description
    });
    return annotatedTuples;
  }

  toTuples() {
    const tuples = [];
    this.appendTuple(tuples, this.version, "version", 4);

    if (this.hasWitnesses()) {
      this.appendTuple(
        tuples,
        MyTransaction.ADVANCED_TRANSACTION_MARKER,
        "marker"
      );
      this.appendTuple(tuples, MyTransaction.ADVANCED_TRANSACTION_FLAG, "flag");
    }

    this.appendVarIntTuple(tuples, this.ins.length, "txInVarInt");
    this.ins.forEach((txIn, i) => this.processTxIn(tuples, txIn, `txIn[${i}]`));
    this.appendVarIntTuple(tuples, this.outs.length, "txOutVarInt");
    this.outs.forEach((txOut, i) =>
      this.processTxOut(tuples, txOut, `txOut[${i}]`)
    );

    if (this.hasWitnesses()) {
      this.ins.forEach((input, i) =>
        this.processWitness(tuples, input.witness, `witness[${i}]`)
      );
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
    witness.forEach((buf, i) =>
      this.appendVarSlice(tuples, buf, `${label}[${i}]`)
    );
  }

  generateDescription(tuple) {
    let description;
    let decoded;

    switch (tuple[1]) {
      case "version":
        decoded = this.version;
        description = `This is a 4-byte little-endian integer, representing the transaction version`;
        break;
      case "marker":
        decoded = MyTransaction.ADVANCED_TRANSACTION_MARKER;
        description = `This is a one-byte marker (required to be '00') that serves as an indicator that the given transaction incorporates Segregated Witness (segwit) data.`;
        break;
      case "flag":
        decoded = MyTransaction.ADVANCED_TRANSACTION_FLAG;
        description = `A flag byte that follows the marker byte in transactions with witness data. It must be '01' to indicate that witness data follows.`;
        break;
      case "txInVarInt":
        decoded = this.ins.length;
        description = `This is a variable integer (VarInt) that denotes the number of transaction inputs.`;
        break;
      case /^txIn\[(\d+)\]hash$/.test(tuple[1]) && tuple[1]:
        var match = tuple[1].match(/^txIn\[(\d+)\]hash$/);
        var index = parseInt(match[1]);
        var big = this.ins[index].hash;
        decoded = this.convertEndian(big.toString("hex"));
        description = `This is the hash of the transaction input at index ${index}. Note that the transaction hash here is in big-endian format, whereas in other places it is typically represented in little-endian format.`;
        break;
      case /^txIn\[\d\]index$/.test(tuple[1]) && tuple[1]:
        var match = tuple[1].match(/^txIn\[(\d+)\]index$/);
        var index = parseInt(match[1]);
        decoded = this.ins[index].index;
        description = `This is a 4-byte little-endian integer which represents the index of the specific output in the previous transaction.`;
        break;
      case /^txIn\[\d\]scriptVarInt$/.test(tuple[1]) && tuple[1]:
        var match = tuple[1].match(/^txIn\[(\d+)\]scriptVarInt$/);
        var index = parseInt(match[1]);
        decoded = this.ins[index].script.length;
        description = `This is a variable integer (VarInt) that denotes the length of the subsequent unlocking script.`;
        break;
      case /^txIn\[\d\]script$/.test(tuple[1]) && tuple[1]:
        var match = tuple[1].match(/^txIn\[(\d+)\]script$/);
        var index = parseInt(match[1]);
        var script = this.ins[index].script;
        decoded = bitcoinjs.script.toASM(script);
        description = `This is the unlocking script (scriptSig), providing proof of ownership of the bitcoins being spent.`;
        break;
      case /^txIn\[\d\]sequence$/.test(tuple[1]) && tuple[1]:
        var match = tuple[1].match(/^txIn\[(\d+)\]sequence$/);
        var index = parseInt(match[1]);
        decoded = this.ins[index].sequence;
        description = `This is a 4-byte little-endian number that specifies the relative locktime of the transaction input.`;
        break;
      case "txOutVarInt":
        decoded = this.outs.length;
        description = `This is a variable integer (VarInt) that denotes the number of subsequent transaction outputs.`;
        break;
      case /^txOut\[\d\]value$/.test(tuple[1]) && tuple[1]:
        var match = tuple[1].match(/^txOut\[(\d+)\]value$/);
        var index = parseInt(match[1]);
        decoded = this.outs[index].value;
        description = `This is an 8-byte little-endian number that represents the amount of bitcoin to be sent in satoshis.`;
        break;
      case /^txOut\[\d\]scriptVarInt$/.test(tuple[1]) && tuple[1]:
        var match = tuple[1].match(/^txOut\[(\d+)\]scriptVarInt$/);
        var index = parseInt(match[1]);
        decoded = this.outs[index].script.length;
        description = `This is a variable integer (VarInt) that denotes the length (in bytes) of the subsequent locking script.`;
        break;
      case /^txOut\[\d\]script$/.test(tuple[1]) && tuple[1]:
        var match = tuple[1].match(/^txOut\[(\d+)\]script$/);
        var index = parseInt(match[1]);
        var script = this.outs[index].script;
        console.log(script);
        console.log(typeof script);
        decoded = bitcoinjs.script.toASM(script);
        try {
        const address = bitcoinjs.address.fromOutputScript(script);
        description = `This is the locking script (scriptPubKey), specifying the conditions under which the output can be spent. The scriptPubkey can be encoded as the following address: ${address}`;
        } catch (error) {
          description = `NO ADDRESS FOUND`;
        }
        break;
      case /^witness\[\d\]VarInt$/.test(tuple[1]) && tuple[1]:
        var match = tuple[1].match(/^witness\[(\d+)\]VarInt$/);
        var index = parseInt(match[1]);
        decoded = this.ins[index].witness.length;
        description = `This is a variable integer (VarInt) that indicates the number of witness items for the transaction input.`;
        break;
      case /^witness\[\d\]\[\d\]scriptVarInt$/.test(tuple[1]) && tuple[1]:
        var match = tuple[1].match(/^witness\[(\d+)\]\[(\d+)\]scriptVarInt$/);
        var index = parseInt(match[1]);
        var witnessIndex = parseInt(match[2]);
        decoded = this.ins[index].witness[witnessIndex].length;
        description = `This is a variable integer (VarInt) that denotes the length of the subsequent witness item.`;
        break;
      case /^witness\[\d\]\[\d\]script$/.test(tuple[1]) && tuple[1]:
        var match = tuple[1].match(/^witness\[(\d+)\]\[(\d+)\]script$/);
        var index = parseInt(match[1]);
        var witnessIndex = parseInt(match[2]);

        var script = this.ins[index].witness[witnessIndex];
        var scriptHex = script.toString("hex");
        if (scriptHex !== "") {
          let scriptWithPushdata = bitcoinjs.script.fromASM(scriptHex);
          decoded = bitcoinjs.script.toASM(scriptWithPushdata);
          try {
            const worksifscript = Buffer.from(decoded, "hex");
            decoded = bitcoinjs.script.toASM(worksifscript);
            description = `This is the redeem script for the transaction input.`;
          } catch (error) {
            description = `This is the witness item. For segwit transactions, the witness item is the unlocking script (scriptSig).`;
          }
        } else {
          decoded = "";
        }

        break;
      case "locktime":
        decoded = this.locktime;
        description = `This is a 4-byte little-endian number that specifies the absolute locktime of the transaction.`;
        break;
      default:
        description = "No description available";
    }

    return [decoded, description];
  }

  convertEndian(hexStr) {
    // Validate input
    if (hexStr.length % 2 !== 0) {
      throw new Error("Invalid hexadecimal string, length must be even.");
    }

    // Reverse the byte order
    let result = "";
    for (let i = hexStr.length - 2; i >= 0; i -= 2) {
      result += hexStr.substr(i, 2);
    }

    return result;
  }
}

export default MyTransaction;
