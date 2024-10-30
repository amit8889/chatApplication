const express = require('express');
const app = express()
const path = require('path')

//dot env setup
require('dotenv').config({ path: './config/config.env' })




// static file render
app.use(express.static(path.join(__dirname,'./public')));
app.get("*",async(req,res)=>{
    res.sendFile(path.resolve(__dirname,'./public/index.html'))

})
module.exports  = app;