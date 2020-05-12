const socket = io()

//Elements
const $form = document.querySelector('#chat')
const $input = $form.querySelector('#inpChat')
const $formbutton = $form.querySelector('button')
const $shareButton = document.querySelector('#sendLoc')
const $sideBar = document.querySelector('#chat_sidebar')

const $messages = document.querySelector('#messages')
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild

    //height of new message
    const newMessagestyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessagestyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const contentHeight = $messages.scrollHeight

    //how far have i scrolled 
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(contentHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = contentHeight
    }
}

socket.on('locationMessage', (url) => {
    const html = Mustache.render($locationTemplate, {
        location: url.location,
        user: url.username,
        createdAt: moment(url.createdAt).format('MMMM D YYYY h:mma')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render($messageTemplate, {
        message: message.text,
        user: message.username,
        createdAt: moment(message.createdAt).format('MMMM D YYYY h:mma')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})
socket.on('roomData', ({room, users}) =>  {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    $sideBar.innerHTML = html
})

$form.addEventListener('submit', (e) => {
    e.preventDefault()
    $formbutton.setAttribute('disabled', 'disabled')
    //e.target.elements.inpChat.value
    socket.emit('sendMessage', $input.value, (e) =>  {
        $formbutton.removeAttribute('disabled')
        $input.value = ''
        $input.focus()
        console.log('the message was ', e)
    })
})

$shareButton.addEventListener('click', () =>  {
    if(!navigator.geolocation){
        socket.emit('sendMessage', 'Geolocation is not supported')
    }else{
        $shareButton.setAttribute('disabled', 'disabled')
        navigator.geolocation.getCurrentPosition((position) =>  {
            socket.emit('sendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () => {
                $shareButton.removeAttribute('disabled')
                console.log( 'Location shared')
            })
        })
    }
})

socket.emit('join', {
    username, room
}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})