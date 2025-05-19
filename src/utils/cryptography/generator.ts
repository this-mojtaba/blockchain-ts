import { webcrypto as crypto } from 'node:crypto';

/**
 * Converts an ArrayBuffer to PEM format (Base64 with header and footer).
 * @param buffer ArrayBuffer containing the key data.
 * @param type The key type ('PUBLIC KEY' or 'PRIVATE KEY').
 * @returns The key string in PEM format.
 */
function arrayBufferToPem(buffer: ArrayBuffer, type: 'PUBLIC KEY' | 'PRIVATE KEY'): string {
  const base64 = Buffer.from(buffer).toString('base64');
  const formattedBase64 = base64.replace(/(.{64})/g, '$1\n');
  return formattedBase64;
}

/**
 * Generates an ECDSA public and private key pair in PEM format.
 * @param namedCurve The ECDSA curve name ('P-256' or 'secp256k1'). Defaults to 'P-256'.
 * @returns Promise with an object containing publicKeyPem and privateKeyPem.
 */
export async function generateKeyPair(
  namedCurve: 'P-256' | 'secp256k1' = 'P-256'
): Promise<{ publicKeyPem: string; privateKeyPem: string }> {
  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: namedCurve
      },
      true, // Whether the key is extractable (for converting to PEM)
      ['sign', 'verify'] // Key usages
    );

    // Export the public key in SPKI format
    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyPem = arrayBufferToPem(publicKeyBuffer, 'PUBLIC KEY');

    // Export the private key in PKCS#8 format
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    const privateKeyPem = arrayBufferToPem(privateKeyBuffer, 'PRIVATE KEY');

    return { publicKeyPem: publicKeyPem.trim(), privateKeyPem: privateKeyPem.trim() };
  } catch (error) {
    console.error('Error during key pair generation:', error);
    throw error;
  }
}
