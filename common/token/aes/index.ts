import { AES, enc, mode, lib, pad } from "crypto-js"
import { getMax } from "../../commons"
import { TokenAesCipherV0 } from "./TokenAesCipherV0"
import { TokenAesCipherVx } from "./TokenAesCipherVx"

export interface TokenAesCipher {
    swapArr: () => number[] | null
    genIv: (key: lib.WordArray) => lib.WordArray
    ver: () => string
}

const hexToCipherParams = (hexCiphertext: string) => ({ ciphertext: enc.Hex.parse(hexCiphertext) }) as lib.CipherParams

const genAes256Bit = () => lib.WordArray.random(32)
const hexToKey = (hexKey: string) => enc.Hex.parse(hexKey)
const keyToHex = (key: lib.WordArray) => enc.Hex.stringify(key)

const tokenCipher = (version: string): TokenAesCipher => {
    if (!version)
        return new TokenAesCipherVx()
    switch (version) {
        case 'vx':
            return new TokenAesCipherVx()
        case 'v0':
            return new TokenAesCipherV0()

        default:
            return new TokenAesCipherVx()
    }
}

const tokenSwap = (aesKey: string, swaps: Array<number> | null) => {
    if (swaps == null || swaps.length == 0)
        return aesKey;
    if (swaps.length % 2 !== 0) {
        swaps.pop(); // Remove last element if array length is odd
    }
    const lengthStr = aesKey.length;
    const lengthSwap = swaps.length;
    if (aesKey.length < 64 || lengthSwap === 0 || getMax(swaps) > lengthStr) {
        throw new Error("Invalid input.")
    }

    const arr = aesKey.split("")
    for (let i = 0; i < swaps.length; i += 2) {
        const oddIndex = swaps[i];
        const evenIndex = swaps[i + 1];
        [arr[oddIndex], arr[evenIndex]] = [arr[evenIndex], arr[oddIndex]]; // Swap characters
    }
    return arr.join(""); // Convert array back to string
}

export const decryptAesHexToken = (token: string) => {
    const regex = /^([0-9a-f]*)\.([0-9a-f]{32}|[0-9a-f]{64})\.(.*)$/
    const matches = token.match(regex)
    if (matches) {
        let version = 'vx'
        if (matches[3]) {
            version = matches[3]
        }
        const tknCipher = tokenCipher(version);
        try {
            const key = hexToKey(tokenSwap(matches[2], tknCipher.swapArr()))
            const iv = tknCipher.genIv(key)
            const ciphertext = hexToCipherParams(matches[1]);
            const decrypted = AES.decrypt(ciphertext, key, { iv, mode: mode.CBC, padding: pad.Pkcs7 })
            return decrypted.toString(enc.Utf8)
        } catch (e) {
            return `${e}`
        }
    }
    return 'Invalid token';
}

export const encryptToHex = (data: string, ver: string = 'vx', keyHex?: string) => {
    const tknCipher = tokenCipher(ver);
    const key = keyHex? hexToKey(keyHex): genAes256Bit();
    const iv = tknCipher.genIv(key)

    const encrypted = AES.encrypt(data, key, { iv, mode: mode.CBC, padding: pad.Pkcs7 }).ciphertext.toString(enc.Hex)
    return `${encrypted}.${tokenSwap(keyToHex(key), tknCipher.swapArr())}.${tknCipher.ver()}`
}