const generateMessage = (text,username) =>  {
    return {
        text,
        username,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (location, username) => {
    return {
        username,
        location: `https://google.com/maps?q=${location.latitude},${location.longitude}`
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}