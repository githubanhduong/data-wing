import { lib } from "crypto-js";
import type { TokenAesCipher } from ".";

export class TokenAesCipherV0 implements TokenAesCipher {
    public swapArr() {
        return null
    }

    public genIv(): lib.WordArray {
        return lib.WordArray.create([], 16);
    }

    public ver() {
        return "v0"
    }
}