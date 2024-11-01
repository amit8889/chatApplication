import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { socketInit, sendDirectMessage } from "../../services/websocket.js";
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

  useEffect(() => {
    const socket = socketInit(loginData?.accessToken);
    if (socket) {
      socket.on("searchUser", (data) => {
        console.log("=====search user data====", data);
        setSearchResult(data);
      });

      socket.on("directMessage", (data) => {
        console.log("=====direct message data====", data);
        let msg = messages.direct[data.from] || [];
        console.log(messages)
        msg.push({
          email: data.from,
          message: data.message,
          name: data.name,
        });

        if (msg.length > 100) {
          msg.shift();
        }
        console.log()
        setMessages((prevMessages) => ({
          ...prevMessages,
          direct: {
            ...prevMessages.direct,
            [data.from]: msg,
          },
        }));
        const users=[...usersAndRoom]
         const findUser = users.find(val=>val.email == data.from)
         console.log("======>",findUser)
        if (!findUser) {
          console.log(usersAndRoom)
          setUsersAndRoom((prev) => [...prev, { email: data.from, name: data.name }]);
        }
      });

      socket.on("userDisconnected",(data) => {
        console.log("=====user disconnected====", data);
        const users = [...usersAndRoom]
        console.log(users)
        const filterUsers = users.filter(val=> val.email!=data.email)
        setUsersAndRoom(filterUsers)
      });
    }
  }, [loginData?.accessToken]);

  const handleSendMessage = () => {
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
    }
    setMessage("");
  };

  const onUserAndRoomSelect = (data) => {
    setSelectedUser(data);
  };

  const handleFileUpload = async (file) => {
    if (!file) {
      alert('Please select a file first!');
      return;
    }
    const formData = new FormData();
    formData.append('media', file);

    try {
      const response = await uploadFile(formData, loginData.accessToken);
      if (response) {
        setMessage(response);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setDisableButton(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds 2 MB. Please select a smaller file.');
      return;
    }

    setDisableButton(true);
    handleFileUpload(file);
  };

  // Define the handleSearchUser function
  const handleSearchUser = (data) => {
    const emailExists = usersAndRoom.some(item => item.email === data.email);
    if (!emailExists) {
      setUsersAndRoom([...usersAndRoom, { ...data }]);
    }
  };

  return (
    <div className={styles.container}>
      {searchResult && <SearchPopUp searchResult={searchResult} handleSearchUser={handleSearchUser} />}
      {isCreateGrpPopupOpen && <CreateGroupPopup setIsCreateGrpPopupOpen={setIsCreateGrpPopupOpen} />}
      <Sidebar
        usersAndRoom={usersAndRoom}
        onUserAndRoomSelect={onUserAndRoomSelect}
        setSearchResult={setSearchResult}
        selectedUser={selectedUser}
        setIsCreateGrpPopupOpen={setIsCreateGrpPopupOpen}
      />
      <div className={styles.main}>
        <div className={styles.messages}>
          {selectedUser && messages.direct[selectedUser.email]?.map((msg, index) => (
            <p key={index} className={loginData.email !== msg.email ? styles.ownMessage : styles.message}>
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
          <button disabled={disableButton} style={{ opacity: disableButton ? 0.5 : 1 }} className={styles.sendBtn} onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
