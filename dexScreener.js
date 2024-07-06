import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import axios from 'axios';
import { storeData,replaceData,tokenTimeCheck } from './utils.js';
import { sendTelegramMsg } from './tgBot.js'
import { findTotalHolders } from './findTotalHolders.js'
import { holdersPercentage } from './holders.js';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const dataPath = path.join(__dirname, 'data', 'new_solana_tokens.json');
const botPath = path.join(__dirname, 'data', 'bot_results.json');
const rejectedTokensPath = path.join(__dirname, 'data', 'rejected_tokens.json');

const http = axios.create({
    baseURL : 'https://api.dexscreener.com/latest/dex'
})

// check Token if its pass the algorithim or not by connecting dexscreener api
// checking if token creation time older than time specified which is 10 minutes now
// exctract data for passed tokens and stored in another json file
async function checkToken(tokenStoredData,token){
    // checking token age

    try {
        // connecting dexscreener api
        let tokenData = await http.get('/search',{
            params : {
                'q' : token
            }
        });
        // filtering token data from api response
        let pair = tokenData.data.pairs[0];
        let tokenProps = {
                address: pair.baseToken.address,
                name : pair.baseToken.name,
                symbol : pair.baseToken.symbol,
                poolKey : tokenStoredData.pool_key,
                platform : tokenStoredData.platform,
                url : pair.url,
                txn24: parseInt(pair.txns.h24.buys),
                volume : parseInt(pair.volume.h24),
                volume5m : parseInt(pair.volume.m5),
                priceChange : parseInt(pair.priceChange.h24),
                priceChange5m : parseInt(pair.priceChange.m5),
                liquidity : parseInt(pair.liquidity.usd),
                fdv : parseInt(pair.fdv),
                mc: (parseInt(pair.fdv)/1000) +"K",
                tokenAccounts : 0,
                ratio : 0,
                supply : 0,
                rayPct : 0,
                top10Pct : 0
            }
        // token detection algorithim 
        if (tokenProps.fdv > 20000 && tokenProps.txn24 > 200){
            let tokenAccounts = await findTotalHolders(token);
            let holdersPercentages = await holdersPercentage(token);
            if(Number.isInteger(tokenAccounts)){
                tokenProps.tokenAccounts = tokenAccounts;
                tokenProps.ratio = Math.floor(parseInt(pair.fdv)/tokenAccounts);
            }
                tokenProps.supply = holdersPercentages.tokenTotalSupply;
                tokenProps.rayPct = holdersPercentages.rayPct;
                tokenProps.top10Pct = holdersPercentages.top10Pct;
                if(tokenProps.rayPct <= 25){
                    let displayData = [
                        tokenProps  
                    ]
                    await sendTelegramMsg(tokenProps);
                    storeData(botPath,tokenProps);
                    console.table(displayData);
                }else {
                    console.log('rejected token after pct',token);
                    storeData(rejectedTokensPath,tokenProps);
                    console.log(chalk.bgRed(JSON.stringify(tokenProps)));
                }
            // console.log(chalk.blue(JSON.stringify(tokenProps)));
        }else {
            console.log('rejected token less volume less txn',token);
            storeData(rejectedTokensPath,tokenProps);
            console.log(chalk.bgRed(JSON.stringify(tokenProps)));
        }
        // return the token
        return tokenStoredData;
    }catch(err){
        console.log('something wrong with dexscreener',token);
        console.log(err.message);
        console.log(token);
    }
};

// readData is the main function to read data and store it
export async function readData()  {
    // console.log(chalk.yellow("Start Reading Data"));
    let newTokenJson = [];
    // read created token file to check it
    fs.readFile (dataPath, (err, fileData) =>{
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }
    let json = [];
    try {
      json = JSON.parse(fileData.toString());

      // check length of data array
      if(json.length > 0){
      // annonymous function to use await for checkToken function
      (async function(){
        for await ( const token of json ){
            let tokenBolean = tokenTimeCheck(token.timestamp);
            // if token age is smaller than 10 minutes will be stored in new array in data file
            if(tokenBolean){
                await checkToken( token,token.baseInfo.baseAddress);
            }else {
                newTokenJson.push(token) 
            }
        }
        // replace the token creation file with only unchecked ones
        await replaceData(dataPath,newTokenJson);
    })();
      }

    } catch (parseError) {
      console.error(`Error parsing JSON from file: ${parseError}`);
      return;
    }
  });
}
