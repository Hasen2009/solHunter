
// this method shows 429 too many requests because getProgramAccounts excess limits
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection } from "@solana/web3.js";
const solanaConnection = new Connection('https://mainnet.helius-rpc.com/?api-key=0d39621b-9712-47e4-92c8-24065ae41685');

export async function getTokenAccounts(tokenAddress)  {
    try{
    const accounts = await solanaConnection.getProgramAccounts(
        TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        {
            dataSlice: {
                offset: 0, // number of bytes
                length: 0, // number of bytes
            },
            filters: [
                {
                    dataSize: 165, // number of bytes
                },
                {
                    memcmp: {
                        offset: 0, // number of bytes
                        bytes: tokenAddress, // base58 encoded string
                    },
                },
            ],
        }
    );
        return accounts.length;
    }catch(err){
        console.log(err.message)
    }
};