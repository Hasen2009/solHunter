import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import dotenv from 'dotenv';
dotenv.config();

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
// console.table(Object.keys(platformsSigners).find(key => platformsSigners[key] === 'pumpFun'))