import type { IBodyInput, IRequest } from '@ServerTypes';
import { CustomError, formatMessage, verifySignature } from '@utils';

export async function verifySignatureBody(req: IRequest): Promise<void> {
  const bodyData = req.bodyData as IBodyInput;
  const { signature, publicKey } = bodyData;
  const message = formatMessage(bodyData);
  const senderPublicKey = publicKey ? publicKey : bodyData.fromAddress;
  const isValid = await verifySignature(senderPublicKey, message, signature!);
  if (!isValid) {
    throw CustomError('Invalid signature');
  }
}
