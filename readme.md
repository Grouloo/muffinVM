# muffinVM

## Introduction

muffinVM is a world-state computer project.

It is used to manage Muffin Network, which provides decentralized services such as a payment system, JS code execution, and soon a file system.

[Read the witepaper](https://wonderful-hexagon-2f3.notion.site/Whitepaper-a0f6c73bcb5c46bdb251399ce424c2f7)

[Technical documentation](https://wonderful-hexagon-2f3.notion.site/Muffin-Technical-Paper-da21399935b04579880e28437d413436)

[API and CLI](https://wonderful-hexagon-2f3.notion.site/Interact-with-Muffin-b10cdc73d9e641648d7b09f177e74752)

[How to write a contract](https://wonderful-hexagon-2f3.notion.site/How-to-write-a-contract-2187325f341842309ba19833583aebe9)

## Install

### Clone the repository

To run your own node on Muffin Network, you'll have to install muffinVM first.

```bash
git clone https://github.com/Grouloo/muffinVM.git
```

### Set up your profile (optionnal)

If you want to become a validator on MMuffin Network,you'll have to configure a profile.

Go to `./muffinVM` and edit the file `me.json` with the following content:

```json
{
  "privateKey": [YOUR PRIVATE KEY],
  "address": [YOUR ADDRESS]
}
```

The private key is needed to sign blocks when validating. It is needed, but if you're not comfortable with that way of doing this, feel free to submit a pull request.

Muffin Network is fully compatible with Ethereum addresses, so if you already have one, you can use it on Muffin.

### Compiling and launching

First, download / update the dependancies

```bash
yarn
```

Then, launch muffinVM with the following command:

```bash
yarn start [--storage PATH_TO_YOUR_STORAGE_FOLDER] [--port PORT_NUMBER]
```
