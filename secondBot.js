
import {filterTokens,chat_id,http} from './constants.js'
import {deleteFilterToken,tokenFullTimeCheck,tokenFullDeleteTimeCheck,tokenFullScore} from './utils.js';
import { sendTelegramMsg } from './tgBot.js'
import fs from 'fs';
import chalk from 'chalk';
import { findTotalHolders } from './findTotalHolders.js'
import { holdersPercentage,creatorHolding } from './holders.js';
import { getMetaData } from './metaData.js'
async function checkToken(tokenStoredData,token,holdersPercentages){
    let tokenAccounts = await findTotalHolders(tokenStoredData.baseInfo.baseAddress);
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
                mc: (parseInt(pair.fdv) < 1000000) ? (parseInt(pair.fdv)/1000) +"K" : (parseFloat(pair.fdv)/1000000).toFixed(2) +"M",
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

        // token detection algorithim 
            tokenProps.supply = tempTokenData.supply;
            tokenProps.rayPct = tempTokenData.rayPct;
            tokenProps.top10Pct = tempTokenData.top10Pct;
            tokenProps.tokenAccounts = tempTokenData.tokenAccounts;
            tokenProps.ratio = Math.ceil(tokenProps.fdv/tokenProps.tokenAccounts);

            let score = tokenFullScore(tokenProps);
            tokenProps.score = score;
            console.log("FIltered Tokens")
            console.table(chalk.bgRed(JSON.stringify(displayData1)));
            if(score >=2){
                if(tokenProps.platform == "pumpFun"){
                    console.log(tokenProps.platform)
                    let metaData = await getMetaData(tokenProps.address);
                    let devSold = await creatorHolding(metaData.creator,tokenProps.address);
                    tokenProps.devSold = devSold;
                    tokenProps.metaData = metaData;
                }
                await sendTelegramMsg(tokenProps,chat_id,3);
                console.log(chalk.bgRed("Token score above 4 and ready to send", token));
                deleteFilterToken(tokenStoredData.lpSignature);
            }
        if(tokenProps.fdv < 20000){
            console.log(chalk.bgRed("Filtered Token fdv less 20K", token));
            console.log(chalk.bgRed( JSON.stringify(tokenProps)));
            deleteFilterToken(tokenStoredData.lpSignature);
        }

    }catch(err){
        console.log('something wrong with dexscreener',token);
        console.log(err.message);
        console.log(token);
    }
};

// readData is the main function to read data and store it
export async function readAgain()  {
    console.log(chalk.bgGreen("Second Bot Start Reading Data"))
    // read created token file to check it
    fs.readFile (filterTokens, (err, fileData) =>{
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
                let tokenBolean = tokenFullTimeCheck(token.timestamp);
                let tokenFullDeleteTimeCheckBoolean = tokenFullDeleteTimeCheck(token.timestamp);
                // if token age is smaller than 1 hour will be stored in new array in data file
                if(tokenBolean){
                    let holdersPercentages = await holdersPercentage(token.baseInfo.baseAddress);
                    if(holdersPercentages.top10Pct <= 55 && holdersPercentages.rayPct <=30 ){
                        await checkToken(token,token.baseInfo.baseAddress,holdersPercentages);
                    }else{
                        deleteFilterToken(token.lpSignature);
                    }
                }else if (tokenFullDeleteTimeCheckBoolean){
                    deleteFilterToken(token.lpSignature);
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
