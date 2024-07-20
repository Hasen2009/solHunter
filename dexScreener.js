import fs from 'fs';
import chalk from 'chalk';
import axios from 'axios';
import { storeData,replaceData,tokenTimeCheck ,tokenScore, tokenPreCheck,deleteData} from './utils.js';
import { sendTelegramMsg } from './tgBot.js'
import { findTotalHolders } from './findTotalHolders.js'
import { holdersPercentage } from './holders.js';
import { dataPath,rejectedTokensPath } from './constants.js';
const http = axios.create({
    baseURL : 'https://api.dexscreener.com/latest/dex'
})

// check Token if its pass the algorithim or not by connecting dexscreener api
// checking if token creation time older than time specified which is 10 minutes now
// exctract data for passed tokens and stored in another json file
async function checkToken(tokenStoredData,token,holdersPercentages){
    let tokenAccounts = await findTotalHolders(tokenStoredData.baseInfo.baseAddress);
    // console.log(token, holdersPercentages.top10Pct,tokenAccounts)
    // checking token age
        if(Number.isInteger(tokenAccounts)){
            let tempToken = {
                tokenAccounts : tokenAccounts,
                rayPct : holdersPercentages.rayPct,
                top10Pct : holdersPercentages.top10Pct,
                supply : holdersPercentages.tokenTotalSupply,
                address : tokenStoredData.baseInfo.baseAddress
            }    
            let isTokenReady = tokenPreCheck(tempToken);
            if(isTokenReady){
                console.log("isTokenReady", token)
                dexScreenerAPICall(tokenStoredData,token,tempToken)
            }
        }
};



async function dexScreenerAPICall(tokenStoredData,token,tempTokenData){
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
                top10Pct : 0,
                score : 0
            }
        // token detection algorithim 
        if (tokenProps.fdv <= 100000 && tokenProps.fdv >= 20000){
            console.log("Token Mc between 100K and 20K", token)
            tokenProps.supply = tempTokenData.supply;
            tokenProps.rayPct = tempTokenData.rayPct;
            tokenProps.top10Pct = tempTokenData.top10Pct;
            tokenProps.tokenAccounts = tempTokenData.tokenAccounts;
            tokenProps.ratio = Math.ceil(tokenProps.fdv/tokenProps.tokenAccounts);

            let score = tokenScore(tokenProps);
            tokenProps.score = score;
            let displayData = [
                tokenProps  
            ]
            console.table(displayData);
            if(score >=2){

                await sendTelegramMsg(tokenProps);
                
                storeData(botPath,tokenProps);
                console.log(chalk.bgRed("Token score above 2 and ready to send", tokenProps.address));
                deleteData(tokenStoredData.baseInfo.baseAddress);
            }
            // console.log(chalk.blue(JSON.stringify(tokenProps)));
        }else if(tokenProps.fdv < 20000){
            console.log(chalk.bgRed("Token fdv less 20K", token));
            deleteData(tokenStoredData.baseInfo.baseAddress);
            storeData(rejectedTokensPath,tokenProps);
        }
        // else {
        //     console.log('rejected token volume > 100K',token);
        //     storeData(rejectedTokensPath,tokenProps);
        //     console.log(chalk.bgRed(JSON.stringify(tokenProps)));
        // }
        
        // else {
        //     console.log('rejected token volume less than 20K',token);
        //     storeData(rejectedTokensPath,tokenProps);
        //     console.log(chalk.bgRed(JSON.stringify(tokenProps)));
        // }
        // return the token
        // return tokenStoredData;
    }catch(err){
        console.log('something wrong with dexscreener',token);
        console.log(err.message);
        console.log(token);
    }
};

// readData is the main function to read data and store it
export async function readData()  {
    console.log(chalk.bgGreen("Start Reading Data"))
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
                // if token age is smaller than 1 hour will be stored in new array in data file
                if(tokenBolean){
                    let holdersPercentages = await holdersPercentage(token.baseInfo.baseAddress);
                    // console.log(token,holdersPercentages.top10Pct,holdersPercentages.rayPct)
                    if(holdersPercentages.top10Pct <= 55 && holdersPercentages.rayPct <=30 ){
                        await checkToken(token,token.baseInfo.baseAddress,holdersPercentages);
                        // newTokenJson.push(token);
                    }
                }else{
                    console.log("tokenBolean deleting", token.baseInfo.baseAddress);
                    deleteData(token.baseInfo.baseAddress)
                }
            }
            // replace the token creation file with only unchecked ones
            // replaceData(dataPath,newTokenJson);
        })();
      }
    } catch (parseError) {
      console.error(`Error parsing JSON from file: ${parseError}`);
      return;
    }
  });
}