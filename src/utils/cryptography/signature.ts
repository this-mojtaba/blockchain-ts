import { webcrypto as crypto } from 'node:crypto';
import { generateKeyPair } from './generator';
import type { IBodyInput } from '@ServerTypes';

/**
 * Converts a PEM encoded key (Base64 format with header and footer) to an ArrayBuffer.
 * @param pem The PEM encoded key string.
 * @returns ArrayBuffer containing the key data.
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64Key = pem
    .replace(/-----BEGIN (PUBLIC|PRIVATE) KEY-----/g, '')
    .replace(/-----END (PUBLIC|PRIVATE) KEY-----/g, '')
    .replace(/\s+/g, '');

  const binaryString = Buffer.from(base64Key, 'base64').toString('binary');
  const buffer = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    buffer[i] = binaryString.charCodeAt(i);
  }
  return buffer.buffer;
}

/**
 * Computes the SHA-256 hash of a given message.
 * @param message The string message to hash.
 * @returns Promise with an ArrayBuffer containing the hash value.
 */
async function sha256(message: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return await crypto.subtle.digest('SHA-256', data);
}

/**
 * Verifies a digital signature using an ECDSA public key.
 * @param publicKeyPem The public key in PEM format.
 * @param message The message that was signed.
 * @param signature The signature to verify (in hexadecimal format).
 * @returns Promise with a boolean indicating whether the signature is valid.
 */
export async function verifySignature(publicKeyPem: string, message: string, signature: string): Promise<boolean> {
  const publicKeyBuffer = pemToArrayBuffer(publicKeyPem);

  try {
    const key = await crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      false,
      ['verify']
    );

    const msgHash = await sha256(message);

    const signatureBuffer = Buffer.from(signature, 'hex');

    const verified = await crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' }
      },
      key,
      signatureBuffer,
      msgHash
    );

    return verified;
  } catch (error) {
    console.error('Error during signature verification:', error);
    return false;
  }
}

/**
 * Signs a message using an ECDSA private key.
 * @param privateKeyPem The private key in PEM format.
 * @param message The message to sign.
 * @returns Promise with a string containing the Base64 encoded signature.
 */
export async function signWithPrivateKey(privateKeyPem: string, message: string): Promise<string> {
  try {
    // Convert the PEM encoded private key to an ArrayBuffer
    const privateKeyBuffer = pemToArrayBuffer(privateKeyPem);

    // Import the ECDSA private key
    const privateKey = await crypto.subtle.importKey(
      'pkcs8', // PKCS#8 format for private key
      privateKeyBuffer,
      {
        name: 'ECDSA',
        namedCurve: 'P-256' // or "secp256k1" depending on your usage
      },
      false,
      ['sign'] // Only for signing
    );

    // Hash the message using SHA-256
    const messageHash = await sha256(message);

    // Sign the message
    const signatureBuffer = await crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' }
      },
      privateKey,
      messageHash
    );

    // Convert the signature to hexadecimal format (changed from Base64)
    return Buffer.from(signatureBuffer).toString('hex');
  } catch (error) {
    console.error('Error during signing:', error);
    return '';
  }
}

export function formatMessage(messages: IBodyInput): string {
  if (typeof messages !== 'object' || messages === null) {
    throw new Error('Invalid message format');
  }

  const priorityKeys = [
    'idOnNetwork',
    'address',
    'publicKey',
    'fromAddress',
    'toAddress',
    'amount',
    'gasFee',
    'timestamp'
  ];

  const orderedValues: string[] = [];

  // Priority keys
  for (const key of priorityKeys) {
    if (key in messages && messages[key] !== undefined && messages[key] !== null) {
      orderedValues.push(String(messages[key]));
    }
  }

  return orderedValues.join('');
}
