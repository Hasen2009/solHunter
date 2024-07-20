
import chalk from 'chalk';
import { storeData } from './utils.js';
import { readData } from './dexScreener.js';
import { rayFee, solanaConnection,getTokenPlatform } from './constants.js';
import { parsingTxn } from './parsingTxn.js'
import { dataPath,nonPumpPath } from './constants.js';


async function monitorNewTokens(connection) {
  console.log(chalk.green(`monitoring new solana tokens...`));
  try {
      // connect to solana rpc
    connection.onLogs(
      rayFee,
      async ({ logs, err, signature }) => {
        console.log(chalk.bgGreen(`found new token signature: ${signature}`));
        try {
          if (err) {
            console.error(`connection contains error, ${signature}`);
            return;
          }  
          let signer = '';
          let baseAddress = '';
          let baseDecimals = 0;
          let baseLpAmount = 0;
          let pool_key = '';
          /**You need to use a RPC provider for getparsedtransaction to work properly.
           * Check README.md for suggestions.
           */

          try{
            const parsedTransaction = await connection.getParsedTransaction(
              signature,
              {
                maxSupportedTransactionVersion: 0,
                commitment: 'confirmed',
              }
            );
  
            if (parsedTransaction && parsedTransaction?.meta.err == null) {
  
              signer =
                parsedTransaction?.transaction.message.accountKeys[0].pubkey.toString();
  
                console.log(`creator, ${signer}`);
  
              const postTokenBalances = parsedTransaction?.meta.postTokenBalances;
  
              const baseInfo = postTokenBalances?.find(
                (balance) =>
                  balance.owner ===
                    '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1' &&
                  balance.mint !== 'So11111111111111111111111111111111111111112'
              );
  
              if (baseInfo) {
                baseAddress = baseInfo.mint;
                baseDecimals = baseInfo.uiTokenAmount.decimals;
                baseLpAmount = baseInfo.uiTokenAmount.uiAmount;
                pool_key = parsedTransaction?.transaction.message.accountKeys[2].pubkey.toString()
              }
            }else{
              console.log("Error parsedTransaction");
              console.log(JSON.stringify(parsedTransaction));
            }
          }catch(err){
            console.log(chalk.red("catch parsing ",signature));
          }
          console.log(`problem maybe`);
          let platform = getTokenPlatform(signer);
          const newTokenData = {
            lpSignature: signature,
            creator: signer,
            timestamp: new Date().toISOString(),
            pool_key,
            platform,
            baseInfo: {
              baseAddress,
              baseDecimals,
              baseLpAmount,
            },
          };
          if(platform != false){
            storeData(dataPath, newTokenData);
            console.log(`everything is good`);
          }
          else {
            storeData(nonPumpPath, newTokenData);
          }
        } catch (error) {
          const errorMessage = `error occured in new solana token log callback function, ${JSON.stringify(error, null, 2)}`;
          console.log(errorMessage);
        }
      },
      'confirmed'
    );
  } catch (error) {
    const errorMessage = `error occured in new sol lp monitor, ${JSON.stringify(error, null, 2)}`;
    console.log(chalk.red(errorMessage));
  }
}
monitorNewTokens(solanaConnection);
// setInterval every 3 minutes checking dexscreener api
setInterval(()=>{
    readData();
},120000);



// async function monitorNewTokens(connection) {
//   console.log(chalk.green(`monitoring new solana tokens...`));
//   try {
//       // connect to solana rpc
//     connection.onLogs(
//       rayFee,
//       async ({ logs, err, signature }) => {
//         console.log(chalk.bgGreen(`found new token signature: ${signature}`));
//         try {
//           if (err) {
//             console.error(`connection contains error, ${signature}`);
//             return;
//           }
//           let parsingTxnBoolean = await parsingTxn(signature,connection);
//           console.log(parsingTxnBoolean);
//           if(!parsingTxnBoolean){
//             setTimeout(await parsingTxn(signature,connection),60000);
//           }
          
//         } catch (error) {
//           const errorMessage = `error occured in new solana token log callback function, ${JSON.stringify(error, null, 2)}`;
//           console.log(errorMessage);
//         }
//       },
//       'confirmed'
//     );
//   } catch (error) {
//     const errorMessage = `error occured in new sol lp monitor, ${JSON.stringify(error, null, 2)}`;
//     console.log(chalk.red(errorMessage),signature);
//   }
// }
