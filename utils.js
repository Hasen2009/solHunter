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
    return (currentTime - tokenTime >= 600) ? true : false;
}

export function tokenScore(token){
  let score = 0;
  let rayPctFromTop10Pct = Math.floor(token.rayPct/token.top10Pct * 100);

  (token.priceChange > 0)? score++ : 0;
  (Math.abs(token.tokenAccounts -  token.txn24) <=90 && token.ratio > 90)? score++ : 0;
  (token.volume > token.fdv)? score++ : 0;
  ((50 >= token.top10Pct >= 30) && rayPctFromTop10Pct <= 50)? score++ : 0;
  (token.symbol.length <= 6 )? score++ : 0;

  return score;
}
