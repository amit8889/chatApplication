const express = require('express');
const app = express()
const path = require('path')

//dot env setup
require('dotenv').config({ path: './config/config.env' })

//body parse
app.use(express.json({extends:true,limit:"1mb"}))
// router register
const userRouter = require('./router/userRouter')
app.use("/user",userRouter)

app.get("/test",(req,res)=>{
    //test router
    res.status(200).json({
        message:"Server is healthy",
        success:true
    })
})
// static file render
app.use(express.static(path.join(__dirname,'./public')));
app.get("*",async(req,res)=>{
    res.sendFile(path.resolve(__dirname,'./public/index.html'))

})
module.exports  = app;