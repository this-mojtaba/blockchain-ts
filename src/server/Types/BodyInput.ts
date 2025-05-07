export interface ISignatureInput {
  signature?: string;
  publicKey: string;
}

export type IBodyInput = ISignatureInput & {
  [key: string]: any;
};
