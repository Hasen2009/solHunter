import fs from 'fs';
import chalk from 'chalk';
import { tokenTimeCheck ,tokenScore, tokenPreCheck,deleteData,tokenDeleteTimeCheck,storeResultsData} from './utils.js';
import { sendTelegramMsg } from './tgBot.js'
import { findTotalHolders } from './findTotalHolders.js'
import { holdersPercentage,creatorHolding } from './holders.js';
import { dataPath,rejectedTokensPath,botPath,failedTxnPath,http,filterTokens,firstChatId } from './constants.js';
import { stringify } from 'querystring';
import { parsingTxn } from './parsingTxn.js'
import { getMetaData } from './metaData.js'

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
            dexScreenerAPICall(tokenStoredData,token,tempToken)
            // let isTokenReady = tokenPreCheck(tempToken);
            // console.log('isTokenReady',isTokenReady);
            // console.log(JSON,stringify(tempToken));
            // if(isTokenReady){
            //     console.log("isTokenReady", token)
            //     dexScreenerAPICall(tokenStoredData,token,tempToken)
            // }
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
                score : 0,
                metaData : {},
                devSold : true
            }
            let displayData1 = [
                tokenProps  
            ]
            console.log(chalk.bgGreen("Token dex call before check mc and score"));
            console.table(chalk.bgRed(JSON.stringify(displayData1)));

        // token detection algorithim 
        if (tokenProps.fdv >= 10000 && tokenProps.volume >= 10000 && tokenProps.fdv <= 300000 ){
            console.log("Token Mc above 30K", token)
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
            if(score >=1){
                if(tokenProps.platform == "pumpFun"){
                    let metaData = await getMetaData(tokenProps.address);
                    let devSold = await creatorHolding(metaData.creator,tokenProps.address,tempTokenData.supply);
                    tokenProps.devSold = devSold;
                    tokenProps.metaData = metaData;
                }
                await sendTelegramMsg(tokenProps,firstChatId,3);
                storeResultsData(filterTokens,tokenStoredData);
                storeResultsData(botPath,tokenProps);
                console.log(chalk.bgRed("Token score above 2 and ready to send", token));
                deleteData(tokenStoredData.baseInfo.baseAddress);
            }
            // console.log(chalk.blue(JSON.stringify(tokenProps)));
        }else if(tokenProps.fdv < 10000){
            console.log(chalk.bgRed("Token fdv less 10K", token));
            console.log(chalk.bgRed( JSON.stringify(tokenProps)));
            deleteData(tokenStoredData.baseInfo.baseAddress);
            storeResultsData(rejectedTokensPath,tokenProps);
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
                let tokenDeleteTimeCheckBoolean = tokenDeleteTimeCheck(token.timestamp);
                // if token age is smaller than 1 hour will be stored in new array in data file
                if(tokenBolean){
                    let holdersPercentages = await holdersPercentage(token.baseInfo.baseAddress);
                    console.log(token,holdersPercentages.top10Pct,holdersPercentages.rayPct)
                    if(holdersPercentages.top10Pct <= 60 || holdersPercentage.rayPct <=35 ){
                        await checkToken(token,token.baseInfo.baseAddress,holdersPercentages);
                    }else{
                        deleteData(token.baseInfo.baseAddress);
                    }
                }else if (!tokenDeleteTimeCheckBoolean){
                    console.log("tokenDeleteTimeCheckBoolean deleting", token.baseInfo.baseAddress);
                    deleteData(token.baseInfo.baseAddress);
                }
            }
        })();
      }
    } catch (parseError) {
      console.error(`Error parsing JSON from file: ${parseError}`);
      return;
    }
  });
}

// readFailedTxn for reading failed transactions
export async function readFailedTxn()  {
    console.log(chalk.bgGreen("Start Reading failed txn"))
    // console.log(chalk.yellow("Start Reading Data"));
    // read created token file to check it
    fs.readFile (failedTxnPath, (err, fileData) =>{
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }
    let json = [];
    try {
      json = JSON.parse(fileData.toString());

      // check length of data array
      if(json.length > 0){
      // annonymous function to use await for parsingTxn function
        (async function(){
            for await ( const signature of json ){
                await parsingTxn(signature);
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
readFailedTxn()  