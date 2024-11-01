import { io } from 'socket.io-client';

let socketInstance = null;
export const socketInit=(token)=>{
   socketInstance =  new io('http://localhost:7000',{
    query:{  accessToken: token}
  });
  handleSocketEvent(socketInstance)
  return socketInstance;
}

export const getSocketInstance=()=>{
  return socketInstance;
}
export function sendMessage(username, message) {
  //socket.send(JSON.stringify({ type: 'send-message', username, message }));
}

function handleSocketEvent(socket){
  //search 
  // socket.on("searchUser",(data)=>{
  //   console.log("=====search user data====",data)
  // })
  // //on direct message
  // socket.on("directMessage",(data)=>{
  //   console.log("=====direct message data====",data)
  // })
}
export function sendDirectMessage(data){
  socketInstance.emit("directMessage",data)
}
export const createGroup = async(groupName,users)=>{
  socketInstance.emit("createRoom",{
    roomName:groupName,
    emails:users
  })

}