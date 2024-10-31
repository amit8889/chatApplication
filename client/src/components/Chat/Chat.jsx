import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { socketInit, sendDirectMessage } from "../../services/websocket";
import styles from "./Chat.module.css";
import SeachPopUp from "../SearchPopUp/SeachPopUp"
function Chat({ loginData }) {
  const [message, setMessage] = useState("");
  // const [messages, setMessages] = useState([{username:"Atul", message:"Hey, How are you?"},
  //     {username:"Atul", message:"Hey, How are you doing?"},
  //     {username:"Atul", message:"Hey, How are you?"},{username:"Atul", message:"Hey, How are you doing?"},
  //     {username:"Atul", message:"Hey, How are you?"},{username:"Atul", message:"Hey, How are you doing?"}]);
  //   const [messages, setMessages] = useState({
  //     direct: {
  //       "amit@gmail.com": [
  //         { email: "av416044@gmail.com", message: "hello", name: "amit" },
  //         { email: "abc@gmail.com", message: "yes", name: "test" },
  //       ],
  //     },
  //     room: {
  //       room1: [
  //         { email: "amit@gmail.com", message: "hello", name: "amit" },
  //         { email: "av416044@gmail.com", message: "yes room", name: "test" },
  //       ],
  //     },
  //   });
  const [messages, setMessages] = useState({
    direct: {},
    room: {},
  });
  const [selectedUser, setSelectedUser] = useState(null);
//   const [usersAndRoom, setUsersAndRoom] = useState([
//     {
//       email: "amit@gmail.com",
//       name: "Amit",
//     },
//     {
//       roomName: "room1",
//     },
//   ]);
  const [usersAndRoom, setUsersAndRoom] = useState([]);
  useEffect(()=>{
    console.log("vsal")
    console.log(usersAndRoom)
  },[usersAndRoom])
  const[searchResult,setSearchResult]= useState(null);

  useEffect(() => {
    const socket = socketInit(loginData?.accessToken);
    if (socket) {
      //console.log("====socket connected");
      socket.on("searchUser", (data) => {
       console.log("=====search user data====", data);
        setSearchResult(data)


      });
      //on direct message
      socket.on("directMessage", (data) => {
        console.log("=====direct message data====", data);
        // handle incoming direct message
        let msg = messages["direct"][data.from]
        if(!msg){
            msg = [{
                email:data.from,
                message:data.message
            }]
        }else{
            msg.push({
                email:data.from,
                message:data.message
            })
            if(msg.length>100){
                //remove older message
                msg.shift()
            }
        }
        if(!usersAndRoom.includes(data.form)){
            setUsersAndRoom([...usersAndRoom,{email:data.from,name:data.name}])
        }
        let finalMessage  = {...messages}
        finalMessage["direct"][data.from] = msg
        console.log(finalMessage)
        setMessages(finalMessage)
      });

      //on disconnect
      socket.on("userDisconnected",(data)=>{
        console.log("=====user disconnected====", data);
      })
    }
  }, []);

  const handleSendMessage = () => {
    if(selectedUser?.email){
        let msg = messages["direct"][selectedUser.email]
        if(!msg){
            msg = [{
                email:loginData?.email,
                message:message,
            }]
        }else{
            msg.push({
                email:loginData?.email,
                message:message,
            })
            if(msg.length>100){
                //remove older message
                msg.shift()
            }
        }
        let finalMessage  = {...messages}
        finalMessage["direct"][selectedUser.email] = msg
        console.log(finalMessage)
        setMessages(finalMessage)
        //direct chat
        sendDirectMessage({
            message: message,
            to:selectedUser?.email
        })
    }else if(selectedUser?.roomName){
        //group chat

    }
    setMessage("");
  };

  const onUserAndRoomSelect = (data, room = false) => {
    setSelectedUser(data);
  };
  const handleSearchUser = (data)=>{
    setUsersAndRoom([...usersAndRoom,{...data}])
  }
  return (
    <div className={styles.container}>
        {
            searchResult && <SeachPopUp searchResult={searchResult} handleSearchUser={handleSearchUser}/>
        }
      <Sidebar
        usersAndRoom={usersAndRoom}
        onUserAndRoomSelect={onUserAndRoomSelect}
        setSearchResult={setSearchResult}
        selectedUser={selectedUser}
      />
      <div className={styles.main}>
        <div className={styles.messages}>
          {selectedUser &&
            (selectedUser.email || selectedUser.roomName) &&
            messages[selectedUser.email ? "direct" : "room"][
              selectedUser.email ?? selectedUser.roomName
            ]?.map((msg, index) => (
              <p
                key={index}
                className={
                  loginData.email != msg.email
                    ? styles.ownMessage
                    : styles.message
                }
              >
                <strong>{msg.name}:</strong> {msg.message}
              </p>
            ))}
        </div>

        <div className={styles.msgInput}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className={styles.input}
          />
          <button className={styles.sendBtn} onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
