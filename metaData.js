import { httpPumpFun } from './constants.js'

async function getMetaData(tokenAddress){
    let response = await httpPumpFun.get(tokenAddress);
    let metaData = {
        image : response.data["image_uri"],
        creator : response.data["creator"],
        twitter : response.data["twitter"],
        tg : response.data["telegram"],
        website : response.data["website"],
    }
    return metaData;
}
