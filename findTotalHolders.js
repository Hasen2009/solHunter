import { Helius } from "helius-sdk";

export async function findTotalHolders(token){

    try {
        const helius = new Helius("0d39621b-9712-47e4-92c8-24065ae41685");
        const holders = await helius.rpc.getTokenHolders(token);
        return holders.length;
    }catch(err){
        console.log('Find total holders issue with rpc')
        console.log(err.message)
    }

}
