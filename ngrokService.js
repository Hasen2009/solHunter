
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const ngrok = require("@ngrok/ngrok");
export async function connecToNgrok() {
    try{
    // Establish connectivity
    const listener = await ngrok.forward({ addr: 4040, authtoken: '2iEE7vS22Hk5YR9go8EEEqIEKY7_zRSTuxr3EA9ZQT7UBvxH' });
  
    // Output ngrok url to console
    console.log(`Ingress established at: ${listener.url()}`);
    }catch(err){
        console.log(err.message);
    }

};

const url = await ngrok.connect({
    addr: 4040, authtoken: '2iEE7vS22Hk5YR9go8EEEqIEKY7_zRSTuxr3EA9ZQT7UBvxH'
}); 
console.log(url)
