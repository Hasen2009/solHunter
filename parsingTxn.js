import chalk from 'chalk';
import { getTokenPlatform,solanaConnection,dataPath } from './constants.js';
import { storeData,deleteFailedTxn } from './utils.js';

export async function parsingTxn(signature){
    console.log('start parsing failed txn',signature)
    let signer = '';
    let baseAddress = '';
    let baseDecimals = 0;
    let baseLpAmount = 0;
    let pool_key = '';
    /**You need to use a RPC provider for getparsedtransaction to work properly.
     * Check README.md for suggestions.
     */

    try{
        const parsedTransaction = await solanaConnection.getParsedTransaction(
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
                console.log(chalk.bgGreen("finish parsed failed txn",signature))
            }
            deleteFailedTxn(signature);
            return true;
        }else{
            // return false;
            console.log("Error parsedTransaction");
        }
    }catch(err){
        // return false;
        console.log(chalk.red("catch parsing ",JSON.stringify(err)));
    }
}
