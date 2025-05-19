# ArshXCoin Blockchain (Typescript blockchain)

ArshXCoin is a basic blockchain prototype written in TypeScript using the [Bun](https://bun.sh) runtime. It includes a
simple HTTP server, transaction handling, cryptographic signing, and a proof-of-work consensus algorithm.

---

## 🚀 Features

- Simple public/private key transactions
- Proof of Work (PoW) mining mechanism
- Transaction validation and confirmation
- RESTful API server for blockchain access
- HTML UI to display transactions (like Etherscan)
- MongoDB integration for persistence
- Unit, integration, and learning tests

---

## 📁 Project Structure

<pre>
src/
├── core/ # Blockchain logic (mining, hashing, validation)
├── models/ # Mongoose models (transactions, blocks, etc.)
├── server/
│ └── httpServer/ # HTTP server entry
├── utils/ # Helper functions (crypto, logging)
├── worker.ts # Background worker for mining or sync
├── tests/ # Unit & integration tests
├── html-ui/ # Static frontend (etherscan-like view)
.bash/
└── test-integrate.sh # Integration test script
.env-example
</pre>

---

## 🛠 Installation

### Prerequisites

- [Bun](https://bun.sh/)
- Node.js (optional, for tooling)
- MongoDB

### Clone & Setup

```bash
git clone git@github.com:this-mojtaba/blockchain-ts.git
cd blockchain-ts
bun install
```

### Environment Variables

Rename .env-example to .env and fill the values:

MODE=development

HTTP_PORT=2001 NODE_ADDRESS=http://localhost:2001

APP_LOG_FILE=my_path/logs.txt

MONGODB_URI=mongodb://127.0.0.1:27017/node_1?authSource=admin

MONGODB_USERNAME=

MONGODB_PASSWORD=

DEFAULT_NODES_TO_CONNECT=http://localhost:2002, http://localhost:2003

| Script          | Description                      |
| --------------- | -------------------------------- |
| `bun run dev`   | Start server in development mode |
| `bun run start` | Start production server          |

### 🌐 API Endpoints

GET /ping

Description: Test the availability of a node in the network.

POST /node/register

Description: Register a new node with another node in the network.

Request Body:

<pre>{
  "idOnNetwork": "string",
  "address": "string",
  "publicKey": "string",
  "signature": "string"
}</pre>

POST /node/heartbeat

Description: Send a heartbeat signal to let other nodes know this node is alive.

Request Body:

<pre>{
  "idOnNetwork": "string",
  "signature": "string",
  "publicKey": "string"
}</pre>

POST /node/disconnect

Description: Notify other nodes when this node is disconnecting from the network.

Request Body:

<pre>{
  "idOnNetwork": "string",
  "signature": "string",
  "publicKey": "string"
}</pre>

POST /blockchain/receive

Description: Receive a newly mined block from another node.

Request Body:

<pre>{
  "idOnNetwork": "string",
  "signature": "string",
  "publicKey": "string",
  "block": {
    "index": "number",
    "previousHash": "string",
    "hash": "string",
    "nonce": "number",
    "difficulty": "number",
    "timestamp": "number",
    "transactions": [
      {
        "fromAddress": "string",
        "toAddress": "string",
        "amount": "number",
        "gasFee": "number",
        "txHash": "string",
        "signature": "string"
      }
    ],
    "totalFees": "number",
    "miner": "string",
    "miningTime": "number"
  }
}</pre>

GET /blockchain/get-full-chain

Description: Retrieve the full blockchain from a specific node.

POST /mempool-transaction/send

Description: Send a new transaction to the node's mempool.

Request Body:

<pre>```{
  "publicKey": "string",
  "fromAddress": "string",
  "toAddress": "string",
  "amount": "number",
  "gasFee": "number",
  "timestamp": "number",
  "signature": "string"
}```</pre>

GET /transaction/search Description: Search transactions across the blockchain network.

### 💻 Frontend

There is a simple HTML page in /public/arshXCoinScan.html that connects to your backend and shows the transaction list
similar to Etherscan.

To serve it statically, you can use any web server or embed it in your backend route.

### 🔐 Cryptography

ECC (Elliptic Curve Cryptography) with secp256r1 (via crypto)

Signature creation and verification for each transaction

Public key used as wallet address

### ⛓ Proof of Work

Each block is mined using a PoW algorithm. The difficulty is defined in .env and determines the number of leading zeros
in the block hash.

```bash
while (true) {
  const dataToHash = previousHash + timestamp + formatedTransactions + nonce;
  hash = createHash('sha256').update(dataToHash).digest('hex');

  if (hash.startsWith(DIFFICULTY_PREFIX)) {
    break;
  }
  nonce++;
}
```

🙋 About This project was developed as a learning-focused blockchain prototype for educational purposes. Contributions
and feedback are welcome!
