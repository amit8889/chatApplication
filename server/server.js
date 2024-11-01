const app = require('./app')
const server = require('http').createServer(app)
const {socketInit,getSocketInstance} = require("./connection/socketConnection")



// initalize socket
socketInit(server);
require('./controller/socketController')


//initalize db connecton
const {connectSql} = require('./connection/dbConnection')
connectSql()
const PORT = process.env.PORT || 8000
//server initalization
server.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})
