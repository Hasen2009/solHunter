import fs from 'fs';
import chalk from 'chalk';
import { dataPath } from './constants.js';

// storing data by reading the file and rewrite 
export function storeData(dataFilePath, newData) {
  try {
    let json;
    let data = fs.readFileSync(dataFilePath);
    json = JSON.parse(data.toString());
    json.push(newData);
    fs.writeFileSync(dataFilePath,JSON.stringify(json, null, 2))

  } catch (parseError) {
    console.error(`Error parsing JSON from file: ${parseError}`);
    return;
  }
  // fs.readFileSync(dataPath, (err, fileData) => {
  //   if (err) {
  //     console.error(`Error reading file: ${err}`);
  //     return;
  //   }
  //   let json;
  //   try {
  //     json = JSON.parse(fileData.toString());
  //   } catch (parseError) {
  //     console.error(`Error parsing JSON from file: ${parseError}`);
  //     return;
  //   }
  //   json.push(newData);

  //   fs.writeFileSync(dataPath, JSON.stringify(json, null, 2), (writeErr) => {
  //     if (writeErr) {
  //       console.error(`Error writing file: ${writeErr}`);
  //     }
  //   });
  // });
}

// replace data in token creation file with unchecked ones only
export function replaceData(dataFilePath,leftData) {
  try{
    fs.writeFileSync(dataFilePath,JSON.stringify(leftData, null, 2))

  }catch (parseError) {
    console.error(`Error parsing JSON from file: ${parseError}`);
    return;
  }
    // fs.writeFileSync(dataPath, JSON.stringify(leftData, null, 2), (writeErr) => {
    //   if (writeErr) {
    //     console.error(`Error writing file: ${writeErr}`);
    //   }
    // });
}


// check if token age 1 Hours old or not

export function tokenTimeCheck(time){
    let currentTime = Math.ceil(Date.parse(new Date().toISOString())/1000);
    let tokenTime = Math.ceil(Date.parse(time)/1000);
    return (currentTime - tokenTime <= 3600) ? true : false;
}
 
export function tokenScore(token){
  let score = 0;
  let rayPctFromTop10Pct = Math.floor(token.rayPct/token.top10Pct * 100);

  // (token.priceChange > 0)? score++ : 0;

  if(token.tokenAccounts >  token.txn24 && token.ratio > 90 && token.txn24 >=500 && token.tokenAccounts >=500){
    score++;
  }else {
    if(token.txn24 >=500 && token.tokenAccounts >=500 && token.ratio > 90) {
    let pctAcc = Math.floor(((token.txn24 - token.tokenAccounts)/ token.tokenAccounts) * 100);

    (pctAcc <= 20 && token.ratio > 90)? score++ : 0;
  }}

  if(token.volume > token.fdv ){
    score++;
  }else {
    let pct = Math.floor(((token.fdv - token.volume)/ token.volume) * 100);
    pct <=30 ? score++ : 0;
  }
  (token.volume >= 20000) ? score++ : 0;
  // (token.rayPct <= 20 && token.rayPct >= 10) ? score++ : 0 ;
  // (token.txn24 >=500 && token.tokenAccounts >=500) ? score++ : 0;
  (token.top10Pct < 50 && token.top10Pct >= 29 && rayPctFromTop10Pct <= 50 && token.rayPct <= 20 && token.rayPct >= 10)? score++ : 0;
  (token.symbol.length <= 6 && token.symbol.length > 2 && token.symbol == token.name)? score++ : 0;
  // (token.symbol == token.name )? score++ : 0;
  return score;
}

export function tokenPreCheck(token){
  let rayPctFromTop10Pct = Math.floor(token.rayPct/token.top10Pct * 100);
  if(token.rayPct <= 60){
    console.log("tokenPreCheck", token.address);
    deleteData(token.address);
    return false;
  }
  return (token.tokenAccounts >=500 && token.top10Pct < 50 && token.top10Pct >= 29 && rayPctFromTop10Pct <= 45 && token.rayPct <= 20 && token.rayPct >= 10) ? true : false
}

export function deleteData(tokenAddress){
  console.log('deleting broo')
  console.log(chalk.bgRed(tokenAddress))
    try {
      let json;
      let data = fs.readFileSync(dataPath);
      json = JSON.parse(data.toString());
      // let index = json.findIndex(i => i.lpSignature === deletedToken.lpSignature);;
      let newJson = json.filter((el)=>el.baseInfo.baseAddress != tokenAddress);

      // console.log('length',json.length);
      // console.log('newJson',newJson.length);
      // console.log('index',index);
      fs.writeFileSync(dataPath,JSON.stringify(newJson, null, 2))
    } catch (parseError) {
      console.error(`Error parsing JSON from file: ${parseError}`);
      return;
    }
}