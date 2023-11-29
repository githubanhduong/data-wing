// import { lib, enc, AES, mode, pad } from 'crypto-js';
// import { getMax } from './commons';

// export const genAes256BitToHex = () => enc.Hex.stringify(lib.WordArray.random(32))
// export const hexToKey = (hexKey: string) => enc.Hex.parse(hexKey);
// // const countKeyLength = (hexString: string) => {
// //     // Convert the hexadecimal string to a byte array
// //     const byteArray = hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16));

// //     // Calculate the length of the byte array in bits
// //     const byteLength = byteArray ? byteArray.length : 0;
// //     const bitLength = byteLength * 8;

// //     return bitLength;
// // }
// // const genIv = (hexKey: string) => {
// //     const keylength = countKeyLength(hexKey)
// //     if (keylength == 128 || keylength == 256) {
// //         const key = enc.Hex.parse(hexKey);
// //         const iv = key.clone().words.slice(0, 4)
// //         const ivBytes = lib.WordArray.create(iv)
// //         return ivBytes
// //     }
// //     throw new Error("Invalid input.")
// // }
// // const genIvFromKey = (key: lib.WordArray) => {
// //     const iv = key.clone().words.slice(0, 4)
// //     return lib.WordArray.create(iv)
// // }

// const genIvType2FromKey = (key: lib.WordArray): lib.WordArray => {
//     const keyWords = key.words;
//     const ivWords = keyWords.slice(0, 4);

//     const byte1 = (ivWords[3] >> 24) & 0xff
//     const byte2 = (ivWords[3] >> 16) & 0xff
//     const byte3 = (ivWords[3] >> 8) & 0xff
//     const byte4 = (keyWords[keyWords.length-1] >> 8) & 0xff
//     ivWords[3] = (byte1 << 24) | (byte2 << 16) | (byte3 << 8) | byte4

//     return lib.WordArray.create(ivWords, 16);
//   };

// const hexToCipherParams = (hexCiphertext: string) => ({ ciphertext: enc.Hex.parse(hexCiphertext) }) as lib.CipherParams

// export const encryptToHex = (plaintext: string, keyHex: string) => {
//     const key = hexToKey(keyHex)
//     const encrypted = AES.encrypt(plaintext, key, {
//         iv: genIvType2FromKey(key),
//         mode: mode.CBC,
//         padding: pad.Pkcs7
//     });
//     return encrypted.ciphertext.toString(enc.Hex);
// }

// export const decryptHex = (hexCiphertext: string, keyHex: string) => {
//     const key = hexToKey(keyHex)
//     const ciphertext = hexToCipherParams(hexCiphertext);
//     const decrypted = AES.decrypt(ciphertext, key, {
//         iv: genIvType2FromKey(key),
//         mode: mode.CBC,
//         padding: pad.Pkcs7
//     });
//     return decrypted.toString(enc.Utf8);
// }

// export const validAesToken = (aesKey: string, swaps: Array<number>) => {
//     if (swaps.length % 2 !== 0) {
//         swaps.pop(); // Remove last element if array length is odd
//     }
//     const lengthStr = aesKey.length;
//     const lengthSwap = swaps.length;
//     if (aesKey.length < 64 || lengthSwap === 0 || getMax(swaps) > lengthStr) {
//         throw new Error("Invalid input.")
//     }

//     const arr = aesKey.split("")
//     for (let i = 0; i < swaps.length; i += 2) {
//         const oddIndex = swaps[i];
//         const evenIndex = swaps[i + 1];
//         [arr[oddIndex], arr[evenIndex]] = [arr[evenIndex], arr[oddIndex]]; // Swap characters
//     }
//     return arr.join(""); // Convert array back to string
// }

// export const intArrSwap = [6, 44, 15, 34, 21, 56];

// export const decryptAesHexToken = (token: string) => {
//     const regex = /^([0-9a-f]*)\.([0-9a-f]{32}|[0-9a-f]{64})$/
//     const matches = token.match(regex)
//     if (matches) {        
//         const hexKey = validAesToken(matches[2], intArrSwap)
//         try {
//             return decryptHex(matches[1], hexKey)
//         } catch (e) {
//             return "Error." + e
//         }
//     }
//     return "Invalid token";
// }