import axios from 'axios';
import {authToken} from './constants.js'

export async function sendTelegramMsg (token,chat_id,initScore)  {
    console.log(token.name,chat_id)
    const url = `https://api.telegram.org/bot${authToken}/sendMessage`;
    const payload = {
        chat_id: chat_id,
        disable_web_page_preview  : true,
        text: `<b>${token.name} #${token.symbol} [ ${token.platform} ]</b>\n\n<code>${token.address}</code>\n\n<b>MC </b> ${token.mc} || <b>Liq</b> ${token.liquidity/1000}K || <b>24h%</b> ${token.priceChange}%\n<b>Score</b> ${token.score}/${initScore} || <b>Volume</b> ${(token.volume < 1000000) ? `${token.volume/1000}K` : `${parseFloat(token.volume/1000000).toFixed(2)}M`} || <b>TxnBuy </b> ${token.txn24}\n<b>Accounts</b> ${token.tokenAccounts} || <b>Ratio</b> ${token.ratio}$|| <b>isDevSold</b> ${(!token.devSold)?"YES" : `${token.devSold}%` }\n<b>Top10</b> ${token.top10Pct}% || <b>RayPct</b> ${token.rayPct}% || <b>TxnSell </b> ${token.txn24Sells}\n\n<a href="${token.url}">Dexscreener</a> || <a href="https://solscan.io/token/${token.address}">Solscan</a> || <a href="https://rugcheck.xyz/tokens/${token.address}">RugCheck</a> || <a href="https://photon-sol.tinyastro.io/en/lp/${token.poolKey}">Photon</a>${(token.metaData.website) ? ` || <a href="${token.metaData.website}">Website</a>` : ""}${(token.metaData.twitter) ? ` || <a href="${token.metaData.twitter}">Twitter</a>` : ""}${(token.metaData.tg) ? ` || <a href="${token.metaData.tg}">telegram</a> ` : ""}`,
        parse_mode: 'html' // html | markdown
    }
    try {
        await axios.post(url, payload)
    }catch(err){
        console.log(err.message);
    }
}

