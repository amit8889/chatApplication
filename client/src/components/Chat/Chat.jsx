import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [socket, setSocket] = useState(null);
  const ref = useRef(false);

  // Initialize socket
  useEffect(() => {
    ref.current = socketInit(loginData?.accessToken);
    setSocket(ref.current);

    return () => {
      ref.current?.disconnect();
    };
  }, [loginData?.accessToken]);

  const handleRoomJoin = useCallback(
    (data) => {
      setMessages((prevMessages) => {
        let msg = prevMessages.room[data.roomName] || [];
        console.log(prevMessages);
        msg.push({
          email: data.email,
          message: `room joined`,
          name: data.name,
        });

        if (msg.length > 100) {
          msg.shift();
        }

        return {
          ...prevMessages,
          room: {
            ...prevMessages.room,
            [data.roomName]: msg,
          },
        };
      });

      setUsersAndRoom((prevUsers) => {
        const findRoom = prevUsers.find(
          (val) => val?.roomName === data.roomName
        );
        //console.log("======>", findRoom);
        if (!findRoom) {
          console.log(usersAndRoom);
          return [...prevUsers, { roomName: data.roomName }];
        }
        return prevUsers;
      });
    },
    [usersAndRoom]
  ); // Add dependencies if needed
  const handleRoomMessage = useCallback((data) => {
    console.log("data", data);
    //console.log("=====room message data====", data);

    setMessages((prevMessages) => {
      const msg = prevMessages.room[data.roomName] || [];
      console.log(prevMessages);
      msg.push({
        email: data.email,
        message: data.message,
        name: data.name,
      });

      if (msg.length > 100) {
        msg.shift();
      }

      return {
        ...prevMessages,
        room: {
          ...prevMessages.room,
          [data.roomName]: msg,
        },
      };
    });

    setUsersAndRoom((prevUsers) => {
      const userExists = prevUsers.find(
        (val) => val?.roomName === data.roomName
      );
      console.log("======>", userExists);
      if (!userExists) {
        console.log(prevUsers);
        return [...prevUsers, { roomName: data.roomName }];
      }
      return prevUsers;
    });
  }, []);
  const handleDirectMessage = useCallback((data) => {
    console.log("=====direct message data====", data);
    setMessages((prevMessages) => {
      const msg = prevMessages.direct[data.from] || [];
      const updatedMessages = [
        ...msg,
        {
          email: data.from,
          message: data.message,
          name: data.name,
        },
      ];

      if (updatedMessages.length > 100) {
        updatedMessages.shift();
      }

      return {
        ...prevMessages,
        direct: {
          ...prevMessages.direct,
          [data.from]: updatedMessages,
        },
      };
    });

    setUsersAndRoom((prev) => {
      const userExists = prev.some((val) => val.email === data.from);
      return userExists
        ? prev
        : [...prev, { email: data.from, name: data.name }];
    });
  }, []);

  const handleUserDisconnected = useCallback((data) => {
    console.log("=====user disconnected====", data);
    setMessages((prevMessages) => {
      let msg = prevMessages.room[data.roomName] || [];
      console.log(prevMessages);
      msg.push({
        email: data.email,
        message: `room leav`,
        name: data.name,
      });

      if (msg.length > 100) {
        msg.shift();
      }

      return {
        ...prevMessages,
        room: {
          ...prevMessages.room,
          [data.roomName]: msg,
        },
      };
    });
    if (!data.roomName) {
      setUsersAndRoom((prevUsers) => {
        return prevUsers.filter((val) => val?.email === data.email);
      });
    }
  }, []);

  const handleSearch = useCallback((data) => {
    console.log("=====search user data====", data);
    setSearchResult(data);
  }, []);
  useEffect(() => {
    if (!socket) {
      return;
    }
    console.log("====================eve================");
    socket.on("searchUser", handleSearch);
    socket.on("directMessage", handleDirectMessage);
    socket.on("userDisconnected", handleUserDisconnected);
    socket.on("roomJoined", handleRoomJoin);
    socket.on("roomMessage", handleRoomMessage);

    return () => {
      socket.off("searchUser", handleSearch);
      socket.off("directMessage", handleDirectMessage);
      socket.off("userDisconnected", handleUserDisconnected);
      socket.off("roomJoined", handleRoomJoin);
      socket.off("roomMessage", handleRoomMessage);
    };
  }, [socket, handleSearch, handleDirectMessage, handleUserDisconnected]);

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


  const isValidURL = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch (error) {
      return false;
    }
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
              <strong>{msg.name}:</strong>
              {msg.message && isValidURL(msg.message) ? (
                <>
                  <div style={{ marginTop: '5px' }}>
                    <iframe
                      src={msg.message}
                      width="300" // Adjust width for better visibility
                      height="200" // Adjust height for better visibility
                      title="URL Preview"
                      style={{ border: 'none' }}
                    />
                  </div>
                  <a 
                    style={{ cursor: "pointer", textDecoration: 'none', color: 'blue',opacity:1 }} 
                    href={msg.message} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Download 
                  </a>
                </>
              ) : (
                <span>{msg.message}</span>
              )}
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
