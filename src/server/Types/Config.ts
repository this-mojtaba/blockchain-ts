export interface IConfig {
  start(): Promise<void>;
  stop(): Promise<void>;
}
