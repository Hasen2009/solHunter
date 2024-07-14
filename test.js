import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import axios from 'axios';
import fs from "fs"
import { fileURLToPath } from 'url';
import { tokenScore } from './utils.js'
import { holdersPercentage } from './holders.js'
import path from 'path';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
// import {LIQUIDITY_STATE_LAYOUT_V4} from '@raydium-io/raydium-sdk';
// import chalk from 'chalk';

// const RPC_ENDPOINT = clusterApiUrl('mainnet-beta');
// const RPC_WEBSOCKET_ENDPOINT ='wss://api.mainnet-beta.solana.com';
// // // raydium pool created account

// const solanaConnection = new Connection('https://mainnet.helius-rpc.com/?api-key=0d39621b-9712-47e4-92c8-24065ae41685');

// async function checkRayHolding(tokenAddress){
//   let token = new PublicKey(tokenAddress);
//   let address = new PublicKey('5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1')
//   try{

//     let rayHolding = await solanaConnection.getParsedTokenAccountsByOwner (address,
//       {
//         mint: token,
//       },
//       {
//         encoding: "jsonParsed",
//       }
//       );
//       let rayAmount = rayHolding.value[0].account.data.parsed.info.tokenAmount.uiAmount;
//       return ( rayAmount > 0 )  ? rayAmount : 0;
//   }catch(err){
//     console.log(err.message);
//   }
// }

// async function topHolders(tokenAdress){
//   let token = new PublicKey(tokenAdress);
//   let address = new PublicKey('5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1')
//   try{
//     let top10Holders = (await solanaConnection.getTokenLargestAccounts (token ,'finalized')).value.slice(0,10);
//     let topHoldersAmount = 0;
//     top10Holders.forEach((account)=>{
//       topHoldersAmount += account.uiAmount;
//     })
//     return (topHoldersAmount > 0) ? topHoldersAmount : 0 ;
//   }catch(err){
//     console.log(err.message);
//   }
// }

// async function tokenSupply(tokenAddress){
//   try{
//     let token = new PublicKey(tokenAddress);

//     const supply = await solanaConnection.getTokenSupply(
//       token,'confirmed', 
//     );
//     console.log(supply.value.uiAmount)
//   }catch(err){
//     console.table(err.message,tokenAddress);
//   }
// }
// tokenSupply('kFjbSyZMNRqjmVhL9T8XuZju3g8ocTegJxUUPVdpump');
// import { Helius } from "helius-sdk";

// const helius = new Helius("0d39621b-9712-47e4-92c8-24065ae41685");

// const response = await helius.rpc.getTokenHolders("6VeSg58mGb8SGuJ8VPq8JcrD8WdfHemCvvUJrfK8pump");
// console.log(response.length);

// async function checkLiquidity(connection) {
//     console.log(chalk.green(`monitoring new solana tokens...`));
//     const parsedTransaction = await solanaConnection.getParsedTransaction(
//         '2jbJU5UGTuqFk8mtF1iSfEGxmqtDQBDrWHVQ3p9PXv6NGEZJzCFeFpDH3RwmnWm95nBy6uprBKBBa9KUdrZNaAh3',
//         {
//           maxSupportedTransactionVersion: 0,
//           commitment: 'confirmed',
//         }
//       );
//     //   console.log(parsedTransaction);
//       let pool_key = parsedTransaction?.transaction.message.accountKeys[2].pubkey.toString();
//       console.log(pool_key)
//     try {
//         const acc = await solanaConnection.getMultipleAccountsInfo([new 
//             PublicKey('ziaD8WGCZwa11uwNvFL4TxBCKUuGBmWU2qJN2XYAwzK')])
//             const parsed = acc.map((v) => LIQUIDITY_STATE_LAYOUT_V4.decode(v.data))
            
//             const lpMint = parsed[0].lpMint
//             let lpReserve = parsed[0].lpReserve
//             console.log(lpMint,lpReserve);
//             const accInfo = await solanaConnection.getParsedAccountInfo(new PublicKey(lpMint));
//             const mintInfo = accInfo?.value?.data?.parsed?.info;
//             lpReserve = lpReserve / Math.pow(10, mintInfo?.decimals)
//             const actualSupply = mintInfo?.supply / Math.pow(10, mintInfo?.decimals)
//             console.log(`lpMint: ${lpMint}, Reserve: ${lpReserve}, Actual Supply: ${actualSupply}`);

//             //Calculate burn percentage
//             const maxLpSupply = Math.max(actualSupply, (lpReserve - 1));
//             const burnAmt = (lpReserve - actualSupply)
//             console.log(`burn amt: ${burnAmt}`)
//             const burnPct = (burnAmt / lpReserve) * 100;
//             console.log(`${burnPct} LP burned`);

//       } catch (error) {
//         const errorMessage = `error occured in new solana token log callback function, ${JSON.stringify(error, null, 2)}`;
//         console.log(chalk.red(errorMessage));
//       }
//   }
  
// monitorNewTokens(solanaConnection);
// setInterval every 5 minutes checking dexscreener api

// import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
// import { clusterApiUrl, Connection } from "@solana/web3.js";

// (async () => {
//   const MY_TOKEN_MINT_ADDRESS = "6VeSg58mGb8SGuJ8VPq8JcrD8WdfHemCvvUJrfK8pump";
// //   const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
// try{
//     const accounts = await solanaConnection.getProgramAccounts(
//         TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
//         {
//           dataSlice: {
//             offset: 0, // number of bytes
//             length: 0, // number of bytes
//           },
//           filters: [
//             {
//               dataSize: 165, // number of bytes
//             },
//             {
//               memcmp: {
//                 offset: 0, // number of bytes
//                 bytes: MY_TOKEN_MINT_ADDRESS, // base58 encoded string
//               },
//             },
//           ],
//         }
//       );
//       console.log(
//         `Found ${accounts.length} token account(s) for mint ${MY_TOKEN_MINT_ADDRESS}`
//       );
// }catch(err){
//     console.log(err.message)
// }


//   /*
//   // Output (notice the empty <Buffer > at acccount.data)
  
//   Found 3 token account(s) for mint BUGuuhPsHpk8YZrL2GctsCtXGneL1gmT5zYb7eMHZDWf
//   [
//     {
//       account: {
//         data: <Buffer >,
//         executable: false,
//         lamports: 2039280,
//         owner: [PublicKey],
//         rentEpoch: 228
//       },
//       pubkey: PublicKey {
//         _bn: <BN: a8aca7a3132e74db2ca37bfcd66f4450f4631a5464b62fffbd83c48ef814d8d7>
//       }
//     },
//     {
//       account: {
//         data: <Buffer >,
//         executable: false,
//         lamports: 2039280,
//         owner: [PublicKey],
//         rentEpoch: 228
//       },
//       pubkey: PublicKey {
//         _bn: <BN: ce3b7b906c2ff6c6b62dc4798136ec017611078443918b2fad1cadff3c2e0448>
//       }
//     },
//     {
//       account: {
//         data: <Buffer >,
//         executable: false,
//         lamports: 2039280,
//         owner: [PublicKey],
//         rentEpoch: 228
//       },
//       pubkey: PublicKey {
//         _bn: <BN: d4560e42cb24472b0e1203ff4b0079d6452b19367b701643fa4ac33e0501cb1>
//       }
//     }
//   ]
//   */
// })();

// const authToken = '7244419453:AAFqYKkmNY2O_QrQrzMXpN8VC3YvvfR1xok';
// const chat_id = '45717611' //bot id;

// const chat_id = "-1002198435565" ; // group

// export async function sendTelegramMsg ()  {
//     const url = `https://api.telegram.org/bot${authToken}/sendMessage`;
//     const payload = {
//         chat_id: chat_id,
//         disable_web_page_preview  : true,
//         text: "<b>${token.name} #${token.symbol}</b>",
//         parse_mode: 'html' // html | markdown
//     }
//     try {
//         let res = await fetch(url, {
//           method : 'POST',
//           body : JSON.stringify(payload)
//         })
//         console.log(res)
//     }catch(err){
//         console.log(err.message);
//     }
// }

// sendTelegramMsg()

const dataPath = path.join(__dirname, 'downloads/data', 'bot_results.json');
const botPath = path.join(__dirname, 'downloads/data', 'filter_tokens.json');
function storeData() {
  fs.readFile(dataPath, (err, fileData) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }
    let newData = [];
    try {
      let json = JSON.parse(fileData.toString());
      for  ( const token of json ){
        let score = tokenScore(token);
        token.score = score;
        (score > 3) ? newData.push(token) : false;
      }
    } catch (parseError) {
      console.error(`Error parsing JSON from file: ${parseError}`);
      return;
    }

    fs.writeFile(botPath, JSON.stringify(newData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(`Error writing file: ${writeErr}`);
      }
    });
  });
}
// storeData();
async function t (){
  let t = await holdersPercentage("7y5RDq2FAg4FQyetb6RKGHad3fYhDcT6Jbhj4QR5pump");
  console.log(t);
}
