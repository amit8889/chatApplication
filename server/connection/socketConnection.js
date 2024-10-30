const socketIo = require('socket.io');

let io = null;
const socketInit =(appServer)=>{
     io = socketIo(appServer,{cors: {
        origin: '*'
      }});
}
const getSocketInstance = ()=>{
    console.log("getSocketInstance")
    return io;
};

module.exports= {socketInit,getSocketInstance}