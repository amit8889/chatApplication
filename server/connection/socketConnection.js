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

const disconnetAllSocket = ()=>{
  io.sockets.sockets.forEach((socketData,id) => {
    socketData.disconnect()
  });
}
module.exports= {socketInit,getSocketInstance,disconnetAllSocket}