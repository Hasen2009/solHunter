import fs from 'fs';
import chalk from 'chalk';
import { dataPath,failedTxnPath,filterTokens,successTokens } from './constants.js';

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
}

export function storeResultsData(dataFilePath, newData) {
  fs.readFile(dataFilePath,"utf8", (err, fileData) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }
    let json;
    try {
      json = JSON.parse(fileData.toString());
    } catch (parseError) {
      console.error(`Error parsing JSON from file: ${parseError}`);
      return;
    }
    json.push(newData);

    fs.writeFile(dataFilePath, JSON.stringify(json, null, 2),{encoding: "utf8"} ,(writeErr) => {
      if (writeErr) {
        console.error(`Error writing file: ${writeErr}`);
      }
    });
  });
}

// replace data in token creation file with unchecked ones only
export function replaceData(dataFilePath,leftData) {
    fs.writeFileSync(dataFilePath, JSON.stringify(leftData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(`Error writing file: ${writeErr}`);
      }
    });
}


// check if token age 1 Hours old or not

export function tokenTimeCheck(time){
    let currentTime = Math.ceil(Date.parse(new Date().toISOString())/1000);
    let tokenTime = Math.ceil(Date.parse(time)/1000);
    return (currentTime - tokenTime >= 90 && currentTime - tokenTime <= 3600) ? true : false;
}
// export function collectTimeCheck(time){
//   let currentTime = Math.ceil(Date.parse(new Date().toISOString())/1000);
//   let tokenTime = Math.ceil(Date.parse(time)/1000);
//   return (currentTime - tokenTime >= 90 && currentTime - tokenTime <= 3600) ? true : false;
// }

export function tokenDeleteTimeCheck(time){
  let currentTime = Math.ceil(Date.parse(new Date().toISOString())/1000);
  let tokenTime = Math.ceil(Date.parse(time)/1000);
  return (currentTime - tokenTime <= 3600) ? true : false;
}
 
export function tokenScore(token){
  let score = 0;
  let rayPctFromTop10Pct = Math.floor(token.rayPct/token.top10Pct * 100);
  let buyPressure = Math.floor(((token.txn24 - token.txn24Sells)/token.txn24 * 100));

  // (token.priceChange5m > 0)? score++ : 0;
  if(token.tokenAccounts >= 500 && token.ratio > 90){
    score++;
  }else if(token.tokenAccounts >  token.txn24 && token.ratio > 90 && token.tokenAccounts >=300){
    score++;
  }
  else {
    if(token.tokenAccounts >=300 && token.ratio > 90) {
    let pctAcc = Math.floor(((token.txn24 - token.tokenAccounts)/ token.tokenAccounts) * 100);
    (pctAcc <= 30 && token.ratio > 90) ? score++ : 0;
  }}
  (buyPressure >= 10) ? score++ : 0;
  
  if(token.volume > 100000 && token.fdv > 100000){
    score++;
  }else if(token.volume > token.fdv ){
    score++;
  }
  else if((token.volume >= 50000 && token.fdv >= 50000)){
    let pct = Math.floor(((token.fdv - token.volume)/ token.volume) * 100);
    pct <= 30 ? score++ : 0;
  }
  // (token.volume >= 10000) ? score++ : 0;
  // (token.rayPct <= 20 && token.rayPct >= 10) ? score++ : 0 ;
  // (token.txn24 >=500 && token.tokenAccounts >=500) ? score++ : 0;
  (token.top10Pct <= 55 && token.rayPct <= 20 )? score++ : 0;
  // (token.symbol.trim().length <= 6 && token.symbol.trim().length > 2 && token.symbol.toUpperCase().trim() == token.name.toUpperCase().trim() )? score++ : 0;
  // (token.symbol == token.name )? score++ : 0;
  return score;
}

export function tokenPreCheck(token){
  return (token.tokenAccounts >=100 && token.top10Pct <= 55 && rayPctFromTop10Pct <= 49 && token.rayPct <= 30) ? true : false
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

export function deleteFailedTxn(signature){
  console.log('deleting Failed Txn broo');
  console.log(chalk.bgRed(signature));
  fs.readFile(failedTxnPath, (err, fileData) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }
    let json;
    try {
      json = JSON.parse(fileData.toString());
    } catch (parseError) {
      console.error(`Error parsing JSON from file: ${parseError}`);
      return;
    }
    let newJson = json.filter((el)=>el != signature);

    fs.writeFile(failedTxnPath, JSON.stringify(newJson, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(`Error writing file: ${writeErr}`);
      }
    });
  });
}
export function deleteSuccessToken(address){
  console.log(chalk.bgRed(address));
  console.log('deleting broo')
    try {
      let json;
      let data = fs.readFileSync(successTokens);
      json = JSON.parse(data.toString());
      let newJson = json.filter((el)=>el.baseInfo.baseAddress != address);
      fs.writeFileSync(successTokens,JSON.stringify(newJson, null, 2))
    } catch (parseError) {
      console.log('error deleting Success Token broo');
      console.error(`Error parsing JSON from file: ${parseError}`);
      return;
    }
}
export function tokenFullScore(token){
  let score = 0;
  let rayPctFromTop10Pct = Math.floor(token.rayPct/token.top10Pct * 100);

  // (token.priceChange > 0)? score++ : 0;

  if(token.txn24 >=1000 && token.tokenAccounts >=500){
    score++;
  }

  if(token.volume > token.fdv && token.volume >= 1000000 ){
    score++;
  }
  // (token.volume >= 1000000) ? score++ : 0;
  // (token.rayPct <= 20 && token.rayPct >= 10) ? score++ : 0 ;
  // (token.txn24 >=500 && token.tokenAccounts >=500) ? score++ : 0;
  (token.top10Pct <= 55  && rayPctFromTop10Pct <= 60 && token.rayPct <= 25 )? score++ : 0;
  // (token.symbol.length <= 6 && token.symbol.length > 2 && token.symbol == token.name)? score++ : 0;
  // (token.symbol == token.name )? score++ : 0;
  return score;
}

export function tokenFullTimeCheck(time){
  let currentTime = Math.ceil(Date.parse(new Date().toISOString())/1000);
  let tokenTime = Math.ceil(Date.parse(time)/1000);
  return (currentTime - tokenTime >= 3600 && currentTime - tokenTime <= 86400) ? true : false;
}
export function tokenFullDeleteTimeCheck(time){
  let currentTime = Math.ceil(Date.parse(new Date().toISOString())/1000);
  let tokenTime = Math.ceil(Date.parse(time)/1000);
  return (currentTime - tokenTime >= 86400) ? true : false;
}
 
export function deleteFilterToken(signature){
  try {
    let json;
    let data = fs.readFileSync(filterTokens);
    json = JSON.parse(data.toString());
    let newJson = json.filter((el)=>el.lpSignature != signature);
    fs.writeFileSync(filterTokens,JSON.stringify(newJson, null, 2))
  } catch (parseError) {
    console.error(`Error parsing JSON from file: ${parseError}`);
    return;
  }
}


function temp(address){
  fs.readFile(successTokens,"utf8", (err, fileData) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }
    let json;
    try {
      json = JSON.parse(fileData.toString());
    } catch (parseError) {
      console.log("start deleteSuccessToken")
      console.error(`Error parsing JSON from file: ${parseError}`);
      return;
    }
    let newJson = json.filter((el)=>el.baseInfo.baseAddress != address);

    fs.writeFile(successTokens, JSON.stringify(newJson, null, 2),{encoding: "utf8"}, (writeErr) => {
      if (writeErr) {
        console.error(`Error writing file: ${writeErr}`);
      }
    });
  });
}