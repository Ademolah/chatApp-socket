const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

const app = express()

const server = http.createServer(app)


//initiate socket io and attach it to the http server
const io = socketIo(server)

//serve the static files from the public directory to express
app.use(express.static('public'))

const users = new Set()

io.on('connection', (socket)=>{
    console.log('A user is now connected')

    //handle users when they will join the chat
    socket.on('join', (username)=>{
        users.add(username)
        socket.username = username

        //emit a broadcast to all clients that a user joined
        io.emit(`userJoined`, username)

        //send the updated user list to all clients
        io.emit('userList', Array.from(users))
    })

    //handle incoming messages
    socket.on('chatMessage', (message)=>{
        //broadcast received message to all clients connected
        io.emit('chatMessage', message)
    })

    //handle when a user disconnects
    socket.on('disconnect', ()=>{
        console.log('A user has left')

        users.forEach((user)=> {
            if(socket.username === user){
                users.delete(user)

                io.emit('userLeft', user)

                //send updated user list
                io.emit('userList', Array.from(users))
            }
        })
    })
})

server.listen(3000, ()=>{
    console.log('Server is now listening on port 3000')
})