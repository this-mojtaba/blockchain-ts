# bun-server-template

Welcome to the Bun Server Template! This repository uses <a href="https://bun.sh/">Bun</a> to create an HTTP server and
MongoDB as the primary database. It leverages decorators to define endpoints in a clean and structured way.

Feel free to star the project and contribute by reporting or fixing any issues. 😊

Clone project:

```bash
git clone git@github.com:mojtaba-7/bun-server-template.git
```

Go to the directory:

```bash
cd ./bun-server-template
```

Configure enviroment variables

```bash
cp .env.example .env
```

- Enter log file address <i>APP_LOG_FILE</i>"
- Put <i>MONGODB_URI</i>, <i>MONGODB_USERNAME</i>, <i>MONGODB_PASSWORD</i> based on your approach

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run start
```

Run as development mode:

```bash
bun run dev
```

Run Tests:

```bash
bun run test-all
```

To create an user:

```bash
bun create-user
```

### Coding Guids:

- use decorators to define your endpints
- don't use **_any_** type at all

This project was created using `bun init` in bun v1.1.25. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## To encrypt data:

- first of all `idOnNetwork`
- then `address`
- then `publicKey`
