import { lib } from "crypto-js";
import type { TokenAesCipher } from ".";

export class TokenAesCipherVx implements TokenAesCipher {
    public swapArr():number[] {
        return [6, 44, 15, 34, 21, 56]
    }

    public genIv(key: lib.WordArray): lib.WordArray {
        const keyWords = key.words;
        const ivWords = keyWords.slice(0, 4);

        const byte1 = (ivWords[3] >> 24) & 0xff
        const byte2 = (ivWords[3] >> 16) & 0xff
        const byte3 = (ivWords[3] >> 8) & 0xff
        const byte4 = (keyWords[keyWords.length - 1] >> 8) & 0xff
        ivWords[3] = (byte1 << 24) | (byte2 << 16) | (byte3 << 8) | byte4

        return lib.WordArray.create(ivWords, 16)
    }

    public ver() {
        return "vx"
    }
}