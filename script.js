import { io } from 'socket.io-client';
const buttonClick = document.getElementById('buttonClickId');
const socketIdValue = document.getElementById('socketId');

const socket = io('https://sayedhaider300.github.io:3000/board-server/');
socket.on('connect', () => {
    console.log(socket.id);
})

socket.on("receiveMessage", message => {
    console.log(message);
})

buttonClick.addEventListener("click", () => {
    socket.emit("sendMessage", "this is some message", socketIdValue.value);
});
