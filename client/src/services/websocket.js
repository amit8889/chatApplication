import { io } from 'socket.io-client';

let socketInstance = null;
export const socketInit = (token) => {
    socketInstance = new io('', {
        query: { accessToken: token }
    });
    return socketInstance;
}

export const getSocketInstance = () => {
    return socketInstance;
}

export function sendDirectMessage(data) {
    socketInstance.emit("directMessage", data)
}
export const createGroup = async (groupName, users) => {
    socketInstance.emit("createRoom", {
        roomName: groupName,
        emails: users
    })
}

export const sendMessageInRoom = ({roomName, message}) => {
    socketInstance.emit('messageSendToRoom', {
        roomName,
        message
    })
}