const {getSocketInstance} = require('../connection/socketConnection')

// socket instance
const io = getSocketInstance();
io.on('connection', (socket) => {
    console.log('a user connected');
})