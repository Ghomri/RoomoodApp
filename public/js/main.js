const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});

// Message form server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    chatMessage.scrollTop = chatMessage.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    const msg = e.target.elements.msg.value;

    // Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
    const divWrapper = document.createElement('div');
    divWrapper.classList.add('message-wrapper');
    const div2 = document.createElement('div');
    div2.classList.add('message');


    // I did it!
    if(message.username === username) {
        div2.classList.add('me');
    }
    else 

    // I did it!
    if(message.username === 'Roomood Bot') {
        div2.classList.add('bot');
    }

    div2.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(divWrapper);
    document.querySelector('.message-wrapper:last-child').appendChild(div2);
};

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
};

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}