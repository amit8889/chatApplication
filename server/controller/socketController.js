const {
  getSocketInstance,
  disconnetAllSocket,
  getSocketIdsByEmail,
  searchUser,
} = require("../connection/socketConnection");
const { verifyAccessToken } = require("../services/tokenService");
const { addLiveUser, removeLiveUser } = require("../common/userMethod");

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

  socket.on("message", (data) => {
    //get socketId
    const [socketId] = getSocketIdsByEmail([data.to]);
    if (socketId?.socketId) {
      // to prevent from same room name and socked id
      const targetSocket = io.sockets.sockets.get(socketId?.socketId);
      if (targetSocket) {
        targetSocket.emit("message", { from: email, message: data.message });
      } else {
        socket.emit("userDisconnected", { email: email });
      }
    } else {
      socket.emit("userDisconnected", { email: email });
    }
  });

  //search user
  socket.on("searchUser", async (data) => {
    const liveUser = await searchUser();
    socket.emit("searchUser", liveUser);
  });

  // group chat
  socket.on("createRoom", async (data) => {
    const { roomName, emails } = data;
    const { email, name } = socket.userData;
    const socketIds = getSocketIdsByEmail([emails, email]);
    const room_name = roomName; // `${roomName}_${email.substring(0, 10)}`
    if (socketIds) {
      for (let socket_id of socketIds) {
        const socketData = io.sockets.sockets.get(socket_id?.socketId); // Get the specific socket by ID
        if (socketData) {
          socketData.join(room_name);
          if (!socketData.roomsJoined) {
            socketData.roomsJoined = [];
          }
          const joinData = {
            roomName: room_name,
            email: socketData.userData.email,
            name: socketData.userData.name,
          };
          socket.to(room_name).emit("roomJoin", joinData);
        }
      }
    }
  });

  // send message to room
  socket.on("messageToRoom", async (data) => {
    const { roomName, message } = data;
    socket.to(roomName).emit({
      roomName: roomName,
      message: message,
      email: socket.userData.email,
      name: socket.userData.name,
    });
  });
  socket.on("roomJoin", (data) => {
    const { roomName, email, name } = data;
    socket.join(roomName);
    if (!socket.roomsJoined) {
      socket.roomsJoined = [];
    }
    socket.roomsJoined.push(roomName);
    socket.to(roomName).emit("roomJoin", {
      roomName: roomName,
      email: email,
      name: name,
    });
  });
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
