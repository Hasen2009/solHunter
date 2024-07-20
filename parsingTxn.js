import { getTokenPlatform } from './constants.js';
import { storeData } from './utils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const dataPath = path.join(__dirname, 'data', 'new_solana_tokens.json');
// const nonPumpPath = path.join(__dirname, 'data', 'new_non_pump.json');
export async function parsingTxn(signature,connection){
    console.log('start parsing',signature)
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
            return false;
            // console.log("Error parsedTransaction");
            // console.log(JSON.stringify(parsedTransaction));
        }
    }catch(err){
        return false;
        // console.log(chalk.red("catch parsing ",signature));
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
    return true;
}