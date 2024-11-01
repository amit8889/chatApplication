const {
  getSocketInstance,
  disconnetAllSocket
} = require("../connection/socketConnection");
const { verifyAccessToken } = require("../services/tokenService");
const { addLiveUser, removeLiveUser } = require("../common/userMethod");
const {searchUser,getSocketIdsByEmail} = require('../common/userMethod')

// socket instance
const io = getSocketInstance();
io.use(async (socket, next) => {
  const { accessToken } = socket.handshake.query;
  try {
    const userData = verifyAccessToken(accessToken);
   if (!userData) {
     throw new Error("Authentication error");
    }
    console.log(userData);
    // Attach user data to socket for further use
    socket.userData = userData;
    next();
  } catch (err) {
    console.log("Connection rejected:", err.message);
    next(new Error("Unauthorized connection"));
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");
  const { name, email } = socket.userData;
  addLiveUser({ name, email, status: "ONLINE", socketId: socket.id });

  socket.on("directMessage", async(data) => {
    const { email,name} = socket.userData;
    //get socketId
    const socketId =await getSocketIdsByEmail([data.to]);
    if (socketId) {
      // to prevent from same room name and socked id
      const targetSocket = io.sockets.sockets.get(socketId);
     // console.log(targetSocket)
      console.log({ from: email, message: data.message })
      if (targetSocket) {
        targetSocket.emit("directMessage", { from: email,name:name, message: data.message });
      } else {
        socket.emit("userDisconnected", { email: email });
      }
    } else {
      socket.emit("userDisconnected", { email: email });
    }
  });

  //search user
  socket.on("searchUser", async (data) => {
    const { email } = socket.userData;
    console.log("====search event come==",data)
    const liveUser = await searchUser({search:data,email:email});
    console.log("live")
    console.log(liveUser)
    socket.emit("searchUser", liveUser);
  });

  // group chat
  socket.on("createRoom", async (data) => {
    try {
      const { roomName, emails } = data;
      const { email, name } = socket.userData;
      const socketIds = await getSocketIdsByEmail([ email,...emails],true);
      const room_name = roomName; // Use unique naming if needed
      console.log("=====>ss",socketIds)
      if (socketIds) {
        for (let socket_id of socketIds) {
          const socketData = io.sockets.sockets.get(socket_id);
          if (socketData) {
            await socketData.join(room_name);
            if (!socketData.roomsJoined) {
              socketData.roomsJoined = [];
            }
            const joinData = {
              roomName: room_name,
              email: socketData.userData.email,
              name: socketData.userData.name,
            };
            console.log("=====>3",socketIds,room_name)
            console.log("=====>00",joinData)
            const room = io.sockets.adapter.rooms.get(roomName);
            if (room) {
              const users = Array.from(room);
              console.log("=======43=4")
              console.log(users)
            }
            //io.to(room_name).emit("roomJoined", joinData);
            io.to(room_name).emit("roomJoined", joinData);
          } else {
            console.error(`Socket ID ${socket_id?.socketId} not found.`);
          }
        }
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  });
  

  // send message to room
  socket.on("messageSendToRoom", async (data) => {
    const { roomName, message } = data;
    socket.to(roomName).emit("messageSendToRoom",{
      roomName: roomName,
      message: message,
      email: socket.userData.email,
      name: socket.userData.name,
    });
  });
//   socket.on("roomJoin", (data) => {
//     const { roomName, email, name } = data;
//     socket.join(roomName);
//     if (!socket.roomsJoined) {
//       socket.roomsJoined = [];
//     }
//     socket.roomsJoined.push(roomName);
//     socket.to(roomName).emit("roomJoin", {
//       roomName: roomName,
//       email: email,
//       name: name,
//     });
//   });
  socket.on("leaveRoom", async (data) => {
    const { roomName } = data;
    socket.leave(roomName);
    if (socket.roomsJoined) {
      const index = socket.roomsJoined.indexOf(roomName);
      if (index > -1) {
        socket.roomsJoined.splice(index, 1);
      }
      socket.to(roomName).emit("leaveRoom", {
        roomName: roomName,
        email: email,
        name: name,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    const userData = {
      email: socket.userData.email,
      name: socket.userData.name,
    };
    if (socket.roomsJoined && socket.roomsJoined.length > 0) {
      // Emit to each room that the user has left
      for (const roomName of socket.roomsJoined) {
        const leaveData = {
          roomName: roomName,
          email: userData.email,
          name: userData.name,
        };
        io.to(roomName).emit("roomLeave", leaveData);
      }
    }
    removeLiveUser({ email: userData.email });
    // also fire event to group when user diconnect or join a group
  });
});

process.on("SIGINT", () => {
  disconnetAllSocket();
  process.exit();
});

process.on("SIGTERM", () => {
  disconnetAllSocket();
  process.exit();
});
