import { httpPumpFun } from './constants.js'

export async function getMetaData(tokenAddress){
    console.log(tokenAddress);
    let response = await httpPumpFun.get(tokenAddress);
    let metaData = {
        creator : response.data["creator"],
        twitter : response.data["twitter"],
        tg : response.data["telegram"],
        website : response.data["website"],
    }
    return metaData;
}