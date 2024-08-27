import { SecretNetworkClient, Wallet, coinsFromString } from "secretjs"
import * as fs from "fs"
import dotenv from "dotenv"
dotenv.config()

const wallet = new Wallet(process.env.MNEMONIC)

const contract_wasm = fs.readFileSync("../contract.wasm.gz")

const gatewayAddress = "secret1drjkzeg2x0yyt927zpggnx289aj7ptcq4w6gw3"

const gatewayHash = "dfa2af6f3c1dae11343169466fd936db8cefd5cf4955afd73d778597ec2390a6"

const gatewayPublicKey = "0x04f0c3e600c7f7b3c483debe8f98a839c2d93230d8f857b3c298dc8763c208afcd62dcb34c9306302bf790d8c669674a57defa44c6a95b183d94f2e645526ffe5e"

const gatewayPublicKeyBytes = Buffer.from(gatewayPublicKey.substring(2), "hex").toString("base64")

const secretjs = new SecretNetworkClient({
  chainId: "pulsar-3",
  url: "https://api.pulsar3.scrttestnet.com",
  wallet: wallet,
  walletAddress: wallet.address,
})

// Declare global variables
let codeId
let contractCodeHash
let contractAddress

let upload_contract = async () => {
  console.log("Starting deployment…")

  let tx = await secretjs.tx.compute.storeCode(
    {
      sender: wallet.address,
      wasm_byte_code: contract_wasm,
      source: "",
      builder: "",
    },
    {
      gasLimit: 4_000_000,
    },
  )

  codeId = Number(tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id").value)
  console.log("codeId: ", codeId)

  contractCodeHash = (await secretjs.query.compute.codeHashByCodeId({ code_id: codeId })).code_hash
  console.log(`Contract hash: ${contractCodeHash}`)
}

let instantiate_contract = async () => {
  if (!codeId || !contractCodeHash) {
    throw new Error("codeId or contractCodeHash is not set.")
  }
  console.log("Instantiating contract…")

  let init = {
    gateway_address: gatewayAddress,
    gateway_hash: gatewayHash,
    gateway_key: gatewayPublicKeyBytes,
  }
  let tx = await secretjs.tx.compute.instantiateContract(
    {
      code_id: codeId,
      sender: wallet.address,
      code_hash: contractCodeHash,
      init_msg: init,
      label: "SecretPath RNG " + Math.ceil(Math.random() * 10000),
    },
    {
      gasLimit: 400_000,
    },
  )

  //Find the contract_address in the logs
  const contractAddress = tx.arrayLog.find((log) => log.type === "message" && log.key === "contract_address").value

  console.log("contract address: ", contractAddress)
}

// Chain the execution using promises
upload_contract()
  .then(() => {
    instantiate_contract()
  })
  .catch((error) => {
    console.error("Error:", error)
  })