const {
  getSocketInstance,
  disconnetAllSocket
} = require("../connection/socketConnection");
const { verifyAccessToken } = require("../services/tokenService");
const { addLiveUser, removeLiveUser } = require("../common/userMethod");
const { searchUser, getSocketIdsByEmail } = require('../common/userMethod')

// socket instance
const io = getSocketInstance();
io.use(async (socket, next) => {
  const { accessToken } = socket.handshake.query;
  try {
      const userData = verifyAccessToken(accessToken);
      if (!userData) {
          throw new Error("Authentication error");
      }
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

  socket.on("directMessage", async (data) => {
      const { email, name } = socket.userData;
      //get socketId
      const socketId = await getSocketIdsByEmail([data.to]);
      if (socketId) {
          // to prevent from same room name and socked id
          const targetSocket = io.sockets.sockets.get(socketId);
          if (targetSocket) {
              targetSocket.emit("directMessage", { from: email, name: name, message: data.message });
          } else {
              socket.emit("userDisconnected", { email: email,remove:true });
          }
      } else {
          socket.emit("userDisconnected", { email: email,remove:true });
      }
  });

  //search user
  socket.on("searchUser", async (data) => {
      const { email } = socket.userData;
      const liveUser = await searchUser({ search: data, email: email });
      socket.emit("searchUser", liveUser);
  });

  // group chat
  socket.on("createRoom", async (data) => {
      try {
          const { roomName, emails } = data;
          const { email, name } = socket.userData;
          const socketIds = await getSocketIdsByEmail([email, ...emails], true);
          const room_name = roomName;
          if (socketIds) {
              for (let socket_id of socketIds) {
                  const socketData = io.sockets.sockets.get(socket_id);
                  if (socketData) {
                      await socketData.join(room_name);
                      if (!socketData.roomsJoined) {
                          socketData.roomsJoined = [];
                      }
                      socketData.roomsJoined.push(room_name);
                      const joinData = {
                          roomName: room_name,
                          email: socketData.userData.email,
                          name: socketData.userData.name,
                      };
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
      const room = io.sockets.adapter.rooms;
      socket.to(roomName).emit("roomMessage", {
          roomName: roomName,
          message: message,
          email: socket.userData.email,
          name: socket.userData.name,
      });
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
              io.to(roomName).emit("userDisconnected", leaveData);
          }
      }
      removeLiveUser({ email: userData.email })
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