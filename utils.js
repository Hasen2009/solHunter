import fs from 'fs';

// storing data by reading the file and rewrite 
export function storeData(dataPath, newData) {
  fs.readFile(dataPath, (err, fileData) => {
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

    fs.writeFile(dataPath, JSON.stringify(json, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(`Error writing file: ${writeErr}`);
      }
    });
  });
}

// replace data in token creation file with unchecked ones only
export function replaceData(dataPath, leftData) {
    fs.writeFile(dataPath, JSON.stringify(leftData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(`Error writing file: ${writeErr}`);
      }
    });
}


// check if token age 10 minutes old or not

export function tokenTimeCheck(time){
    let currentTime = Math.ceil(Date.parse(new Date().toISOString())/1000);
    let tokenTime = Math.ceil(Date.parse(time)/1000);
    return (currentTime - tokenTime >= 480) ? true : false;
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

  if(token.volume > token.fdv){
    score++;
  }else {
    let pct = Math.floor(((token.fdv - token.volume)/ token.volume) * 100);
    pct <=20 ? score++ : 0;
  }
  // (token.volume >= 100000) ? score++ : 0 ;
  // (token.rayPct <= 20 && token.rayPct >= 10) ? score++ : 0 ;
  // (token.txn24 >=500 && token.tokenAccounts >=500) ? score++ : 0;
  (token.top10Pct < 50 && token.top10Pct >= 29 && rayPctFromTop10Pct <= 50 && token.rayPct <= 20 && token.rayPct >= 10)? score++ : 0;
  (token.symbol.length <= 6 && token.symbol.length > 2 && token.symbol == token.name)? score++ : 0;
  // (token.symbol == token.name )? score++ : 0;

  return score;
}
