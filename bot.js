import { createRequire } from "module";
const require = createRequire(import.meta.url);
const express = require('express');
const port = 4040;
const bodyParser = require('body-parser')
// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const app = express();

app.get('*',async (req,res)=>{
    res.send('hello post pump');
});

app.post('*',jsonParser,async function(req,res){
    console.log(req.body);
    res.send('hello get pump');
})

app.listen(port,async function(err){
    if(err){
        console.log(err.message);
    }
    console.log('Listening to Port : ',port);
})

