const varuint = require("varuint-bitcoin");

export function toVarInt(value) {
  const varInt = varuint.encode(value);
  return varInt.toString("hex");
}

export function toUInt8(value) {
  const buffer = Buffer.alloc(1);
  buffer.writeUInt8(value);
  return buffer.toString("hex");
}

export function toUInt32LE(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer.toString("hex");
}

export function toBigUInt64LE(value) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(value));
  return buffer.toString("hex");
}

export function Endian(hexStr) {
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