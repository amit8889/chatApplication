import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../Sidebar/Sidebar";
import {
  socketInit,
  sendDirectMessage,
  createGroup,
  sendMessageInRoom,
} from "../../services/websocket.js";
import { uploadFile } from "../../services/api.js";
import styles from "./Chat.module.css";
import SearchPopUp from "../SearchPopUp/SeachPopUp"; // Corrected import
import CreateGroupPopup from "../CreateGroupPopup/CreateGroupPopup.jsx";

function Chat({ loginData }) {
  const [message, setMessage] = useState("");
  const [isCreateGrpPopupOpen, setIsCreateGrpPopupOpen] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [messages, setMessages] = useState({ direct: {}, room: {} });
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersAndRoom, setUsersAndRoom] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  // const[socket,setSocket] = useState(null);
  const ref = useRef(false);
  const handleDirectMessage = (data) => {
    console.log("=====direct message data====", data);
    let msg = messages.direct[data.from] || [];
    console.log(messages);
    msg.push({
      email: data.from,
      message: data.message,
      name: data.name,
    });

    if (msg.length > 100) {
      msg.shift();
    }
    const updatedMessage = {
      ...messages,
      direct: {
        ...messages.direct,
        [data.from]: msg,
      },
    };
    console.log("====updated===", updatedMessage);
    setMessages(updatedMessage);
    const users = [...usersAndRoom];
    console.log(users);
    console.log(data.from);
    const findUser = users.find((val) => val.email === data.from);
    console.log("======>", findUser);
    if (!findUser) {
      console.log(usersAndRoom);
      //   alert("test1")
      setUsersAndRoom((prev) => [
        ...prev,
        { email: data.from, name: data.name },
      ]);
    }
  };

  const handleuserDisconnected = (data) => {
    console.log("=====user disconnected====", data);
    const users = [...usersAndRoom];
    console.log(users);
    const filterUsers = users.filter((val) => val.email !== data.email);
    alert("test2");
    setUsersAndRoom(filterUsers);
  };

  const handleRoomJoin = (data) => {
    console.log("======roomJoined come");
    let msg = messages.room[data.roomName] || [];
    console.log(messages);
    msg.push({
      email: data.email,
      message: `room joined : ${data.name}`,
      name: data.name,
    });

    if (msg.length > 100) {
      msg.shift();
    }
    const updatedMessage = {
      ...messages,
      room: {
        ...messages.room,
        [data.roomName]: msg,
      },
    };
    console.log("====updated===", updatedMessage);
    setMessages(updatedMessage);
    const users = [...usersAndRoom];
    console.log(users);
    console.log(data);
    const findRoom = users.find((val) => val?.roomName === data.roomName);
    console.log("======>", findRoom);
    if (!findRoom) {
      console.log(usersAndRoom);
      // alert("test1")
      setUsersAndRoom((prev) => [...prev, { roomName: data.roomName }]);
    }
  };

  const handleSearch = (data) => {
    console.log("=====search user data====", data);
    setSearchResult(data);
  };

  const handleRoomMessage = (data) => {
    console.log("data", data);
    console.log("=====room message data====", data);
    let msg = messages.room[data.roomName] || [];
    console.log(messages);
    msg.push({
      email: data.email,
      message: data.message,
      name: data.name,
    });

    if (msg.length > 100) {
      msg.shift();
    }
    const updatedMessage = {
      ...messages,
      room: {
        ...messages.room,
        [data.roomName]: msg,
      },
    };
    console.log("====updated===", updatedMessage);
    setMessages(updatedMessage);
    const users = [...usersAndRoom];
    console.log(users);
    console.log(data.from);
    const findUser = users.find((val) => val?.roomName === data.roomName);
    console.log("======>", findUser);
    if (!findUser) {
      console.log(usersAndRoom);
      //   alert("test1")
      setUsersAndRoom((prev) => [...prev, { roomName: data.roomName }]);
    }
  };
  useEffect(() => {
  

    if (!ref.current) {
      ref.current = socketInit(loginData?.accessToken);
    }
    let socket = ref.current;

    console.log("====================eve================");

    socket.on("searchUser", (data) => handleSearch(data));
    socket.on("directMessage", (data) => handleDirectMessage(data));
    socket.on("userDisconnected", (data) => handleuserDisconnected(data));
    socket.on("roomJoined", (data) => handleRoomJoin(data));
    //socket.on("sendToRoom", handleRoomMessage);

    socket.on("testing", (data) => {
      console.log(data);
      handleRoomMessage(data);
    });

    return () => {
      socket.off("searchUser", handleSearch);
      socket.off("directMessage", handleDirectMessage);
      socket.off("userDisconnected", handleuserDisconnected);
      socket.off("roomJoined", handleRoomJoin);
      //  socket.off("sendToRoom", handleRoomMessage)
      socket.off("testing", (data) => {
        console.log(data);
        handleRoomMessage(data);
      });
    };
  }, [loginData?.accessToken, message, messages, usersAndRoom]);

  // useEffect(() => {

  //       const socket = socketInit(loginData?.accessToken);
  //       console.log("====================eve================")

  //         socket.on("searchUser",(data) => {
  //           console.log("=====search user data====", data);
  //           setSearchResult(data);
  //       });
  //         socket.on("directMessage", (data) => {
  //           console.log("=====direct message data====", data);
  //           let msg = messages.direct[data.from] || [];
  //           console.log(messages)
  //           msg.push({
  //               email: data.from,
  //               message: data.message,
  //               name: data.name,
  //           });

  //           if (msg.length > 100) {
  //               msg.shift();
  //           }
  //           const updatedMessage = {
  //               ...messages,
  //               direct: {
  //                   ...messages.direct,
  //                   [data.from]: msg,
  //               },
  //           }
  //           console.log("====updated===", updatedMessage)
  //           setMessages(updatedMessage);
  //           const users = [...usersAndRoom]
  //           console.log(users)
  //           console.log(data.from)
  //           const findUser = users.find(val => val.email === data.from)
  //           console.log("======>", findUser)
  //           if (!findUser) {
  //               console.log(usersAndRoom)
  //               //   alert("test1")
  //               setUsersAndRoom((prev) => [...prev, { email: data.from, name: data.name }]);
  //           }
  //       }
  //     );
  //         socket.on("userDisconnected", (data) => {
  //           console.log("=====user disconnected====", data);
  //           const users = [...usersAndRoom]
  //           console.log(users)
  //           const filterUsers = users.filter(val => val.email !== data.email)
  //           alert("test2")
  //           setUsersAndRoom(filterUsers)
  //       });
  //         socket.on("roomJoined",  (data) => {
  //           console.log("======roomJoined come");
  //           let msg = messages.room[data.roomName] || [];
  //           console.log(messages)
  //           msg.push({
  //               email: data.email,
  //               message: `room joined : ${data.name}`,
  //               name: data.name,
  //           });

  //           if (msg.length > 100) {
  //               msg.shift();
  //           }
  //           const updatedMessage = {
  //               ...messages,
  //               room: {
  //                   ...messages.room,
  //                   [data.roomName]: msg,
  //               },
  //           }
  //           console.log("====updated===", updatedMessage)
  //           setMessages(updatedMessage);
  //           const users = [...usersAndRoom]
  //           console.log(users)
  //           console.log(data)
  //           const findRoom = users.find(val => val?.roomName === data.roomName)
  //           console.log("======>", findRoom)
  //           if (!findRoom) {
  //               console.log(usersAndRoom)
  //               // alert("test1")
  //               setUsersAndRoom((prev) => [...prev, { roomName: data.roomName }]);
  //           }
  //       });
  //         //socket.on("sendToRoom", handleRoomMessage);

  //         socket.on('testing', (data) => {
  //           console.log("data", data);
  //           console.log("=====room message data====", data);
  //           let msg = messages.room[data.roomName] || [];
  //           console.log(messages)
  //           msg.push({
  //               email: data.email,
  //               message: data.message,
  //               name: data.name,
  //           });

  //           if (msg.length > 100) {
  //               msg.shift();
  //           }
  //           const updatedMessage = {
  //               ...messages,
  //               room: {
  //                   ...messages.room,
  //                   [data.roomName]: msg,
  //               },
  //           }
  //           console.log("====updated===", updatedMessage)
  //           setMessages(updatedMessage);
  //           const users = [...usersAndRoom]
  //           console.log(users)
  //           console.log(data.from)
  //           const findUser = users.find(val => val?.roomName === data.roomName)
  //           console.log("======>", findUser)
  //           if (!findUser) {
  //               console.log(usersAndRoom)
  //               //   alert("test1")
  //               setUsersAndRoom((prev) => [...prev, {roomName:data.roomName }]);
  //           }
  //       });

  //     // return () => {

  //     //     socket.off("searchUser", handleSearch);
  //     //     socket.off("directMessage", handleDirectMessage);
  //     //     socket.off("userDisconnected", handleuserDisconnected);
  //     //     socket.off('roomJoined', handleRoomJoin);
  //     //   //  socket.off("sendToRoom", handleRoomMessage)
  //     //     socket.off('testing', (data) => {
  //     //       console.log(data)
  //     //       handleRoomMessage(data)
  //     //   });

  //   //}
  // }, [loginData?.accessToken, messages, usersAndRoom]);

  const handleSendMessage = () => {
    if (!handleSendMessage) {
      alert("Please select group or person ");
      return;
    }
    if (selectedUser?.email) {
      let msg = messages.direct[selectedUser.email] || [];
      msg.push({
        email: loginData.email,
        message: message,
        name: loginData.name || loginData.email,
      });

      if (msg.length > 100) {
        msg.shift();
      }

      setMessages((prevMessages) => ({
        ...prevMessages,
        direct: {
          ...prevMessages.direct,
          [selectedUser.email]: msg,
        },
      }));

      sendDirectMessage({
        message: message,
        to: selectedUser.email,
      });
      setMessage("");
    } else if (selectedUser?.roomName) {
      let msg = messages.room[selectedUser.roomName] || [];
      msg.push({
        email: loginData.email,
        message: message,
        name: loginData.name || loginData.email,
      });

      if (msg.length > 100) {
        msg.shift();
      }

      setMessages((prevMessages) => ({
        ...prevMessages,
        room: {
          ...prevMessages.room,
          [selectedUser.roomName]: msg,
        },
      }));

      sendMessageInRoom({
        message: message,
        roomName: selectedUser.roomName,
      });
      setMessage("");
    }
  };

  const onUserAndRoomSelect = (data) => {
    const users = [...usersAndRoom];
    // console.log(users)
    // console.log(data)
    const findUser = users.find((val) => val.email === data.email);
    console.log("====77==>", findUser);
    console.log(data);
    if (!findUser) {
      console.log(usersAndRoom);
      alert("test3");
      setUsersAndRoom((prev) => [
        ...prev,
        { email: data.from, name: data.name },
      ]);
    }
    setSelectedUser(data);
  };

  const handleFileUpload = async (file) => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append("media", file);

    try {
      const response = await uploadFile(formData, loginData.accessToken);
      if (response) {
        setMessage(response);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setDisableButton(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      alert("File size exceeds 2 MB. Please select a smaller file.");
      return;
    }

    setDisableButton(true);
    handleFileUpload(file);
  };

  // Define the handleSearchUser function
  const handleSearchUser = (data) => {
    const emailExists = usersAndRoom.find((item) => item.email === data.email);
    console.log(emailExists);
    if (!emailExists) {
      alert("test4");
      setUsersAndRoom([...usersAndRoom, { ...data }]);
    }
    setSelectedUser(data);
  };

  const handleGroupCreation = async (groupName, groupData) => {
    createGroup(groupName, groupData);
  };

  return (
    <div className={styles.container}>
      {searchResult && (
        <SearchPopUp
          searchResult={searchResult}
          handleSearchUser={handleSearchUser}
        />
      )}
      {isCreateGrpPopupOpen && (
        <CreateGroupPopup
          handleGroupCreation={handleGroupCreation}
          accessToken={loginData?.accessToken}
          setIsCreateGrpPopupOpen={setIsCreateGrpPopupOpen}
        />
      )}
      <Sidebar
        usersAndRoom={usersAndRoom}
        onUserAndRoomSelect={onUserAndRoomSelect}
        setSearchResult={setSearchResult}
        selectedUser={selectedUser}
        setIsCreateGrpPopupOpen={setIsCreateGrpPopupOpen}
      />
      <div className={styles.main}>
        <div className={styles.messages}>
          {selectedUser &&
            messages?.[selectedUser.roomName ? "room" : "direct"][
              selectedUser.roomName ?? selectedUser.email
            ]?.map((msg, index) => (
              <p
                key={index}
                className={
                  loginData.email !== msg.email
                    ? styles.ownMessage
                    : styles.message
                }
              >
                <strong>{msg.name}:</strong> {msg.message}
              </p>
            ))}
        </div>

        <div className={styles.msgInput}>
          <input type="file" onChange={handleFileChange} />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className={styles.input}
          />
          <button
            disabled={disableButton}
            style={{ opacity: disableButton ? 0.5 : 1 }}
            className={styles.sendBtn}
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
