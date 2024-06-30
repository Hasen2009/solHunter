import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import axios from 'axios';
import { storeData,replaceData,tokenTimeCheck } from './utils.js';
import { sendTelegramMsg } from './tgBot.js'



const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const dataPath = path.join(__dirname, 'data', 'new_solana_tokens.json');
// const botPath = path.join(__dirname, 'data', 'bot_results.json');
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
        // let tokenAccounts = await findTotalHolders(token);
        // filtering token data from api response
        let pair = tokenData.data.pairs[0];
        let tokenProps = {
            address: pair.baseToken.address,
            name : pair.baseToken.name,
            symbol : pair.baseToken.symbol,
            url : pair.url,
            txn24: parseInt(pair.txns.h24.buys),
            volume : parseInt(pair.volume.h24),
            priceChange : parseInt(pair.priceChange.h24),
            liquidity : parseInt(pair.liquidity.usd),
            fdv : parseInt(pair.fdv),
            mc: (parseInt(pair.fdv)/1000) +"K",
            // tokenAccounts : tokenAccounts,
            // ratio : (tokenAccounts > 0) ? Math.floor(parseInt(pair.fdv)/tokenAccounts)  : 0
        }
        // token detection algorithim 
        if (tokenProps.fdv > 10000 && tokenProps.volume > 20000 && tokenProps.txn24 > 300 ){
            // await storeData(botPath,tokenProps);
            await sendTelegramMsg(tokenProps);
            let displayData = [
                tokenProps
            ]
            console.table(displayData);
            // console.log(chalk.blue(JSON.stringify(tokenProps)));
        }else {
            console.log(chalk.bgRed(JSON.stringify(tokenProps)));
        }
        // return the token
        return tokenStoredData;
    }catch(err){
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
