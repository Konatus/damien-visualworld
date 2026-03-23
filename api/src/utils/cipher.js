const FORMAT_DECODED = "utf-8";
const FORMAT_ENCODED = "base64"; // could also be "hex" but that's longer

import CONF from "../conf.js";
// AES-256-CBC nécessite une clé de 32 octets (256 bits)
const CIPHER_KEY = Buffer.alloc(32, CONF.CIPHER_KEY, FORMAT_DECODED);
const CIPHER_IV = Buffer.alloc(16, CONF.CIPHER_IV, FORMAT_DECODED);

import crypto from "crypto";
const secureAlgo = "aes-256-cbc"; // Changed from AES-256-GCM to CBC (simpler, no auth tag needed)
const deprecatedAlgo = "aes192";

export function cipher(dataToBeCiphered) {
  console.log("[CIPHER] Input length:", dataToBeCiphered?.length || 0);
  const cipher = crypto.createCipheriv(secureAlgo, CIPHER_KEY, CIPHER_IV);
  const ciphered = cipher.update(
    dataToBeCiphered,
    FORMAT_DECODED,
    FORMAT_ENCODED
  );
  const result = ciphered + cipher.final(FORMAT_ENCODED);
  console.log("[CIPHER] Output length:", result?.length || 0);
  return result;
}

export function decipher(dataToBeUnciphered) {
  console.log("[DECIPHER] Input:", dataToBeUnciphered);
  console.log("[DECIPHER] Input length:", dataToBeUnciphered?.length || 0);

  for (let algo of [secureAlgo, deprecatedAlgo]) {
    try {
      const decipher = crypto.createDecipheriv(algo, CIPHER_KEY, CIPHER_IV);
      const deciphered = decipher.update(
        dataToBeUnciphered,
        FORMAT_ENCODED,
        FORMAT_DECODED
      );
      const result = deciphered + decipher.final(FORMAT_DECODED);
      console.log("[DECIPHER] Success with algo:", algo);
      console.log("[DECIPHER] Output length:", result?.length || 0);
      return result;
    } catch (error) {
      console.log("[DECIPHER] Failed with algo:", algo, error.message);
    }
  }
  console.error("[DECIPHER] All algorithms failed!");
  return "";
}

export default {
  cipher,
  decipher,
};
