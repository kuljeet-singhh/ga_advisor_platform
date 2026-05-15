import crypto from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;

function getKey() {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("TOKEN_ENCRYPTION_KEY is not set");
  }
  let buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    buf = crypto.createHash("sha256").update(raw, "utf8").digest();
  }
  return buf;
}

export function encryptSecret(plainText) {
  if (plainText == null || plainText === "") return null;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: TAG_LEN });
  const enc = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptSecret(payloadB64) {
  if (payloadB64 == null || payloadB64 === "") return null;
  const key = getKey();
  const buf = Buffer.from(payloadB64, "base64");
  if (buf.length < IV_LEN + TAG_LEN) throw new Error("Invalid ciphertext");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const enc = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, key, iv, { authTagLength: TAG_LEN });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

export function defaultAccessTokenExpiryMs(fromBody) {
  if (typeof fromBody === "number" && Number.isFinite(fromBody)) {
    return fromBody;
  }
  return Date.now() + 55 * 60 * 1000;
}
