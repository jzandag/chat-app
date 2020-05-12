const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const app = express()
const { addUser,removeUser, getUser, getUsersinRoom} = require('./utils/users')

const server = http.createServer(app)
const PORT = process.env.PORT || 3000
const io = socketio(server)

const {generateMessage, generateLocationMessage} = require('./utils/messages')

app.use(express.static(path.join(__dirname, '../public')))

io.on('connection' , (socket) => {
    console.log('New Socket connection successful')

    socket.on('join', ({username , room}, cb) => {
        const {error , user} = addUser({id: socket.id, username, room})

        if(error){
            return cb(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome to the chat!', 'ADMIN'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`, 'ADMIN'))

        io.to(user.room).emit('roomData' , {
            room: user.room,
            users: getUsersinRoom(user.room)
        })
        cb()
    }) 

    socket.on('sendMessage', (chat, callback) =>  {
        const filter = new Filter()
        const user = getUser(socket.id)

        if(filter.isProfane(chat)){
            return callback('Profanity')
        }

        io.to(user.room).emit('message', generateMessage(chat, user.username))
        callback('delivered')
    })

    socket.on('sendLocation', (location, cb) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(location, user.username))
        cb()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has disconnected`, 'ADMIN'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersinRoom(user.room)
            })
        }

    })
})


server.listen(PORT, () => console.log(`Server running on ${PORT}`))
