const users = []

function addUser({id, name , room}){
    const existingUser = users.find((user) => {
        return user.room === room && user.name === name
    })
    if(existingUser){
        return {error: 'Username is taken'}
    }
    const user = {id, name, room};
    users.push(user);
    return {user};
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
  
    if(index !== -1) return users.splice(index, 1)[0];
  }

function getUser(id){
    // console.log(users)
    return users.find((user) => user.id === id)
}

function getUsersInRoom(room){
    return users.filter((user) => user.room === room)
}
module.exports = {addUser, removeUser, getUser, getUsersInRoom}