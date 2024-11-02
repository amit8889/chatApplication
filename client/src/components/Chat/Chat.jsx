import React, { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../Sidebar/Sidebar";
import {
  socketInit,
  sendDirectMessage,
  createGroup,
  sendMessageInRoom,
} from "../../services/websocket.js";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  AppBar,
  Toolbar,
   Modal
} from "@mui/material";
import UploadIcon from '@mui/icons-material/Upload';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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
  const messagesEndRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
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
        if (!findRoom) {
          return [...prevUsers, { roomName: data.roomName }];
        }
        return prevUsers;
      });
    },
    [usersAndRoom]
  ); // Add dependencies if needed
  const handleRoomMessage = useCallback((data) => {
    setMessages((prevMessages) => {
      const msg = prevMessages.room[data.roomName] || [];
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

    // setUsersAndRoom((prevUsers) => {
    //   const userExists = prevUsers.find(
    //     (val) => val?.roomName === data.roomName
    //   );
    //   console.log("======>", userExists);
    //   if (!userExists) {
    //     console.log(prevUsers);
    //     return [...prevUsers, { roomName: data.roomName }];
    //   }
    //   return prevUsers;
    // });
  }, []);
  const handleDirectMessage = useCallback((data) => {
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
    setMessages((prevMessages) => {
      let msg = prevMessages.room[data.roomName] || [];
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
    setSearchResult(data);
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }
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
    if (!selectedUser) {
      alert("Please select group or person ");
      return;
    }
    if (!message || !message.trim()) {
      alert("Please enter message");
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
    const findUser = users.find((val) => val.email === data.email);
    if (!findUser) {
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
    if (!emailExists) {
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
    <Box className={styles.container} sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: '#007bff' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Toggle Button for Sidebar */}
        <Button 
          onClick={handleToggleSidebar} 
          sx={{ 
            mr: 2, 
            display: { xs: 'block', md: 'none' }, 
            color: "white" 
          }} // Show on mobile only
          variant="outlined"
        >
          {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </Button>
        
        <Typography 
          variant="h6" 
          sx={{ flexGrow: 1, ml: 1, color: 'white' }}
        >
          {selectedUser?.roomName 
            ? `${selectedUser?.roomName?.substring(0, 10)}`
            : selectedUser?.name 
              ? `${selectedUser?.name?.substring(0, 10)}`
              : "Chat App"}
        </Typography>
        
        <Typography 
          sx={{
            borderRadius: '50px',
            border: '1px solid white',
            padding: '2px 10px',
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }} 
          variant="subtitle1"
        >
          {loginData?.name?.substring(0, 4) || "User"}
        </Typography>
      </Toolbar>
    </AppBar>
      {/* Search Popup */}
      {searchResult && (
        <SearchPopUp
          searchResult={searchResult}
          handleSearchUser={handleSearchUser}
        />
      )}

      {/* Create Group Popup */}
      {isCreateGrpPopupOpen && (
        <CreateGroupPopup
          handleGroupCreation={handleGroupCreation}
          accessToken={loginData?.accessToken}
          setIsCreateGrpPopupOpen={setIsCreateGrpPopupOpen}
        />
      )}

      {/* Sidebar Modal for Mobile View */}
      <Modal
        open={isSidebarOpen}
        onClose={handleToggleSidebar}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center',position:'absolute',left:0,maxWidth:'250px',zIndex:800 }}
      >
        <Box 
          sx={{ 
            width: '100%', 
            maxWidth: '400px', 
            bgcolor: 'background.paper', 
            borderRadius: 1, 
            boxShadow: 3, 
            height: '100%', 
            overflow: 'auto' 
          }}
        >
          <Sidebar
            usersAndRoom={usersAndRoom}
            onUserAndRoomSelect={onUserAndRoomSelect}
            setSearchResult={setSearchResult}
            selectedUser={selectedUser}
            setIsCreateGrpPopupOpen={setIsCreateGrpPopupOpen}
          />
        </Box>
      </Modal>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar for Desktop/Tablets */}
        <Box 
          sx={{ 
            width: { xs: '0', md: '250px' }, 
            display: { xs: 'none', md: 'block' }, 
            borderRight: '1px solid #ccc' 
          }}
        >
          <Sidebar
            usersAndRoom={usersAndRoom}
            onUserAndRoomSelect={onUserAndRoomSelect}
            setSearchResult={setSearchResult}
            selectedUser={selectedUser}
            setIsCreateGrpPopupOpen={setIsCreateGrpPopupOpen}
          />
        </Box>

        {/* Main Content */}
        <Box className={styles.main} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Paper className={styles.messages} elevation={3} sx={{ flex: 1, overflowY: 'auto', padding: 2 }}>
            {selectedUser && messages?.[selectedUser.roomName ? "room" : "direct"][
              selectedUser.roomName ?? selectedUser.email
            ]?.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: loginData.email === msg.email ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Typography
                  className={loginData.email === msg.email ? styles.ownMessage : styles.otherMessage}
                  sx={{
                    maxWidth: "60%",
                    borderRadius: "10px",
                    padding: "8px",
                    backgroundColor: loginData.email === msg.email ? '#d1e7dd' : '#f8d7da',
                    color: loginData.email === msg.email ? '#0f5132' : '#721c24',
                  }}
                >
                  <strong>{msg.name}:</strong>
                  {msg.message && isValidURL(msg.message) ? (
                    <>
                      <Box sx={{ mt: 1 }}>
                        <iframe
                          src={msg.message}
                          width="300"
                          height="200"
                          title="URL Preview"
                          style={{ border: "none", maxWidth: "100%", height: "auto" }}
                        />
                      </Box>
                      <a
                        style={{
                          cursor: "pointer",
                          textDecoration: "none",
                          color: "blue",
                          opacity: 1,
                        }}
                        href={msg.message}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        Download
                      </a>
                    </>
                  ) : (
                    <span styles={{maxWidth:"50vh"}}>{msg.message}</span>
                  )}
                </Typography>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Paper>

          {/* Message Input Section */}
          <Box
      className={styles.msgInput}
      sx={{
        display: 'flex',
        alignItems: 'center',
        position: 'fixed', // Fixed position
        bottom: 0, // Stick to the bottom
        left: 0,
        right: 0,
        padding: 1,
        backgroundColor: '#fff',
        borderTop: '1px solid #ccc',
        zIndex: 1000, // Ensure it stays above other content
      }}
    >
      <input
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button variant="outlined" sx={{height:"2.5rem"}}component="span" startIcon={<UploadIcon />}>
          Upload
        </Button>
      </label>
      <TextField
        value={isValidURL(message) ? message.split('/').pop() : message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        sx={{ flexGrow: 1, ml: 1, mb: { xs: 1, md: 0 } }}
        variant="outlined"
        size="small"
      />
      <Button
        variant="contained"
        disabled={disableButton}
        sx={{ ml: 1, opacity: disableButton ? 0.5 : 1 }}
        onClick={handleSendMessage}
      >
        Send
      </Button>
   
          </Box>
        </Box>
      </Box>
    </Box>
  );
};



  
  


export default Chat;
