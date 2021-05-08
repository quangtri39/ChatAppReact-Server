const httpServer = require("http").createServer();
const express = require('express');
const io = require("socket.io")(httpServer, {
  cors: { origin: "*"}
});
const {addUser, removeUser, getUser, getUsersInRoom} = require('./user.js')
const cors = require('cors');
const router = require('./router');


const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000

io.on("connection", (socket) => {
    socket.on('join',({name, room}, callback) => {
        const {error, user} = addUser({id: socket.id, name, room});
        if(error){
            return callback(error)
        }
        socket.emit('message', {user: 'admin', text: `Bạn đã vào room ${user.room}!`})
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} đã vào room!`}) 

        //gui cho moi nguoi va nguoi dung thong tin nhung nguoi o trong phong
        socket.emit('usersInRoom', {users: getUsersInRoom(user.room)})
        io.to(user.room).emit('usersInRoom', {users: getUsersInRoom(user.room)})

        socket.join(user.room);

        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
        callback()
    })
    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id)
        if(!user){
            return callback('Đã có người đăng nhập tài khoản này rồi')
        }
        io.to(user.room).emit('message', {user: user.name, text: message})
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})

        callback()
    })
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            socket.emit('usersInRoom', {users: getUsersInRoom(user.room)})
            io.to(user.room).emit('message', {user: 'admin', text: `${user.name} đã thoát`})
            io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
        }
    })
});

app.use(router)

httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));