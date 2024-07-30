import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

export const authToken = '7244419453:AAFqYKkmNY2O_QrQrzMXpN8VC3YvvfR1xok';
export const chat_id = '45717611' //bot id;
export const firstChatId = "-1002198435565" ; // group
dotenv.config();
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const dataPath = path.join(__dirname, 'data', 'new_solana_tokens.json');
export const botPath = path.join(__dirname, 'data', 'bot_results.json');
export const nonPumpPath = path.join(__dirname, 'data', 'new_non_pump.json');
export const rejectedTokensPath = path.join(__dirname, 'data', 'rejected_tokens.json');
export const failedTxnPath = path.join(__dirname, 'data', 'failed_txn.json');
export const filterTokens = path.join(__dirname, 'data', 'filter_tokens.json'); 
export const successTokens = path.join(__dirname, 'data', 'success_tokens.json'); 
export const collectedData = path.join(__dirname, 'data', 'data.json'); 


export const http = axios.create({
  baseURL : 'https://api.dexscreener.com/latest/dex'
});

export const httpPumpFun = axios.create({
  baseURL : 'https://frontend-api.pump.fun/coins'
});
const RPC_ENDPOINT = process.env.RPC_ENDPOINT ?? clusterApiUrl('mainnet-beta');
const RPC_WEBSOCKET_ENDPOINT =
  process.env.RPC_WEBSOCKET_ENDPOINT ?? 'wss://api.mainnet-beta.solana.com';

export const solanaConnection = new Connection(RPC_ENDPOINT, {
  wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
});

export const rayFee = new PublicKey(
  '7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5'
);

const pumpFun = "39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg";
const moonShot = "CGsqR7CTqTwbmAUTPnfg9Bj9GLJgkrUD9rhjh3vHEYvh";

const platformsSigners = {
  pumpFun,
  moonShot
}

export function getTokenPlatform(signer){
  let platform = Object.keys(platformsSigners).find(key => platformsSigners[key] === signer);
  return (platform != undefined) ? platform : false;
}
