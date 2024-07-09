import axios from 'axios';
const authToken = '7244419453:AAFqYKkmNY2O_QrQrzMXpN8VC3YvvfR1xok';
// const chat_id = '45717611' //bot id;
const chat_id = "-1002198435565" ; // group

export async function sendTelegramMsg (token)  {
    const url = `https://api.telegram.org/bot${authToken}/sendMessage`;
    const payload = {
        chat_id: chat_id,
        disable_web_page_preview  : true,
        text: `<b>${token.name} #${token.symbol} [ ${token.platform} ]</b>\n\n<code>${token.address}</code>\n\n<b>MC </b> ${token.mc} || <b>Liq</b> ${token.liquidity/1000}K || <b>24h%</b> ${token.priceChange}%\n<b>Score</b> ${token.score}/8 || <b>Volume</b> ${token.volume/1000}K || <b>Txn </b> ${token.txn24}\n<b>Accounts</b> ${token.tokenAccounts} || <b>Ratio</b> ${token.ratio}$\n<b>Top10</b> ${token.top10Pct}% || <b>RayPct</b> ${token.rayPct}%\n\n<a href="${token.url}">Dexscreener</a> || <a href="https://solscan.io/token/${token.address}">Solscan</a> || <a href="https://rugcheck.xyz/tokens/${token.address}">RugCheck</a> || <a href="https://photon-sol.tinyastro.io/en/lp/${token.poolKey}">Photon</a>`,parse_mode: 'html' // html | markdown
    }
    try {
        await axios.post(url, payload)
    }catch(err){
        console.log(err.message);
    }
}
