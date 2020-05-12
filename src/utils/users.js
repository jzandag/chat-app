const users = []

//add
const addUser = ({id , username , room}) => {
    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    //check existing user
    const existingUser = users.find( u => {
        return u.room === room && u.username === username
    })

    //validate username 
    if(existingUser){
        return {
            error: 'Username is in use'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return { user }  
}

//remove
const removeUser = (id) => {
    const index = users.findIndex(u => u.id === id)

    if(index != -1){
        return users.splice(index, 1)[0]
    }
}
//getUser
const getUser = (id) => {
    const user = users.find(u => u.id === id)
    if(!user)
        return {
            error: 'No such user'
        }
    return user
}

//getUsersinRoom
const getUsersinRoom = (room) => {
    room = room.trim().toLowerCase()
    const usersinroom = users.filter(u => u.room === room)
    return usersinroom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersinRoom
}