import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';


const solanaConnection = new Connection('https://mainnet.helius-rpc.com/?api-key=0d39621b-9712-47e4-92c8-24065ae41685');

async function RayHoldAMount(tokenAddress){
  let token = new PublicKey(tokenAddress);
  let address = new PublicKey('5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1')
  try{

    let rayHolding = await solanaConnection.getParsedTokenAccountsByOwner (address,
      {
        mint: token,
      },
      {
        encoding: "jsonParsed",
      }
      );
      let rayAmount = rayHolding.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return ( rayAmount > 0 )  ? rayAmount : 0;
  }catch(err){
    console.log(err.message);
  }
}

async function topHolders(tokenAdress){
  let token = new PublicKey(tokenAdress);
  let address = new PublicKey('5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1')
  try{
    let top10Holders = (await solanaConnection.getTokenLargestAccounts (token ,'finalized')).value.slice(0,10);
    let topHoldersAmount = 0;
    top10Holders.forEach((account)=>{
      topHoldersAmount += account.uiAmount;
    })
    return (topHoldersAmount > 0) ? topHoldersAmount : 0 ;
  }catch(err){
    console.log(err.message);
  }
}

async function tokenSupply(tokenAddress){
  try{
    let token = new PublicKey(tokenAddress);

    const supply = await solanaConnection.getTokenSupply(
      token,'confirmed', 
    );
    let totalSupply = supply.value.uiAmount;
    return (totalSupply > 0) ? totalSupply : 0;
  }catch(err){
    console.table(err.message,tokenAddress);
  }
}

export async function holdersPercentage(tokenAddress){
    let tokenTotalSupply = await tokenSupply(tokenAddress);
    let rayAmount = await RayHoldAMount(tokenAddress);
    let top10Holders = await topHolders(tokenAddress);
    // console.log(tokenTotalSupply,rayAmount,top10Holders);

    let rayPct = Math.floor((rayAmount/tokenTotalSupply) * 100);
    let top10Pct = Math.floor((top10Holders/tokenTotalSupply) * 100);

    let displayData = {
        tokenTotalSupply,
        rayPct,
        top10Pct
    }

    return displayData;
}

export async function creatorHolding(creator,address,supply){
  let token = new PublicKey(address);
  let creatorAdd = new PublicKey(creator)
  try{
    let creatorHolding = await solanaConnection.getParsedTokenAccountsByOwner (creatorAdd,
      {
        mint: token,
      },
      {
        encoding: "jsonParsed",
      }
      );
      let creatorAmount = creatorHolding?.value[0]?.account.data.parsed.info.tokenAmount.uiAmount;
      let devPct = Math.floor((creatorAmount/supply) * 100)
      return ( devPct > 5 )  ? devPct : false;
  }catch(err){
    console.log(err.message);
  }
}