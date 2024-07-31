import { tokenScore,deleteSuccessToken,tokenTimeCheck,storeResultsData } from './utils.js'
import { successTokens,collectedData,http } from './constants.js'
import fs from 'fs';
import chalk from 'chalk';
import { findTotalHolders } from './findTotalHolders.js'
import { holdersPercentage } from './holders.js';

async function collectingData(tokenStoredData){
    try {
        let tokenAccounts = await findTotalHolders(tokenStoredData.baseInfo.baseAddress);
        let holdersPercentages = await holdersPercentage(tokenStoredData.baseInfo.baseAddress);
        let tempTokenData = {
            tokenAccounts : tokenAccounts,
            rayPct : holdersPercentages.rayPct,
            top10Pct : holdersPercentages.top10Pct,
            supply : holdersPercentages.tokenTotalSupply,
            address : tokenStoredData.baseInfo.baseAddress,
            top10List : holdersPercentages.top10HoldersList
        } 
            
        // connecting dexscreener api
        let tokenData = await http.get('/search',{
            params : {
                'q' : tokenStoredData.baseInfo.baseAddress
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
                txn24Sells: parseInt(pair.txns.h24.sells),
                txn5MBuys: parseInt(pair.txns.m5.buys),
                txn5MSells: parseInt(pair.txns.m5.sells),
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
                top10List:[],
                timestamp: new Date().toISOString(),
            }
            // console.log(chalk.bgGreen("Collecting token data"));
        // token detection algorithim 
        if(tokenProps.fdv < 10000){
            // console.log(chalk.bgRed("SUccess Token fdv less 10K"));
            deleteSuccessToken(tokenStoredData.baseInfo.baseAddress)
        }
        tokenProps.supply = tempTokenData.supply;
        tokenProps.rayPct = tempTokenData.rayPct;
        tokenProps.top10Pct = tempTokenData.top10Pct;
        tokenProps.top10List = tempTokenData.top10List;
        tokenProps.tokenAccounts = tempTokenData.tokenAccounts;
        tokenProps.ratio = Math.ceil(tokenProps.fdv/tokenProps.tokenAccounts);

        let score = tokenScore(tokenProps);
        tokenProps.score = score;
        storeResultsData(collectedData,tokenProps);
            
    }catch(err){
        console.log('something wrong with dexscreener');
        console.log(err.message);
    }
}
export async function ReadingSuccessTokens(){
    console.log(chalk.bgGreen("Start Collecting Data"))
    fs.readFile (successTokens,"utf8", (err, fileData) =>{
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
                    await collectingData(token);
                }else{
                    deleteSuccessToken(token.baseInfo.baseAddress)
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
