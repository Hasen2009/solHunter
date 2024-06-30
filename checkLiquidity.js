import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import {LIQUIDITY_STATE_LAYOUT_V4} from '@raydium-io/raydium-sdk';
import chalk from 'chalk';
const heliusConnection = new Connection('https://mainnet.helius-rpc.com/?api-key=0d39621b-9712-47e4-92c8-24065ae41685');

export async function checkLiquidity(pool_key) {
    console.log(chalk.green(`check liquidity...`));
    try {
        const acc = await heliusConnection.getMultipleAccountsInfo([new 
            PublicKey(pool_key)])
            const parsed = acc.map((v) => LIQUIDITY_STATE_LAYOUT_V4.decode(v.data))
            
            const lpMint = parsed[0].lpMint
            let lpReserve = parsed[0].lpReserve
            // console.log(lpMint,lpReserve);
            const accInfo = await heliusConnection.getParsedAccountInfo(new PublicKey(lpMint));
            const mintInfo = accInfo?.value?.data?.parsed?.info;
            lpReserve = lpReserve / Math.pow(10, mintInfo?.decimals)
            const actualSupply = mintInfo?.supply / Math.pow(10, mintInfo?.decimals)
            // console.log(`lpMint: ${lpMint}, Reserve: ${lpReserve}, Actual Supply: ${actualSupply}`);

            //Calculate burn percentage
            const maxLpSupply = Math.max(actualSupply, (lpReserve - 1));
            const burnAmt = (lpReserve - actualSupply)
            // console.log(`burn amt: ${burnAmt}`)
            const burnPct = (burnAmt / lpReserve) * 100;
            // console.log(`${burnPct} LP burned`);
            return(isNaN(burnPct) ? 0 : burnPct);
            


      } catch (error) {
        const errorMessage = `error occured in new solana token log callback function, ${JSON.stringify(error, null, 2)}`;
        console.log(chalk.red(error.Message));
      }
  }
  
