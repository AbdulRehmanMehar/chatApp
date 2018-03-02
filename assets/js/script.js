


/*
------- Socket.io
*/
let socket = io.connect('http://localhost:3000');


// Query DOM
let message = document.getElementById("message-to-send"),
    btn = document.getElementById("send"),
    handle = document.getElementById("handle"),
    output = document.getElementById("output"),
    userID = document.getElementById("userID"),
    feedback = document.getElementById("feedback"),
    clientID = document.getElementById('clientID');
// Emmit Events
btn.addEventListener('click' , () => {
  socket.emit('chat',{
    message: message.value,
    handle: handle.value,
    userID: userID.value,
    clientID: clientID.value
  });
  message.value = "";
});

message.addEventListener('keypress', () => {
  socket.emit('typing',handle.value);
});

// Listen for Events
socket.on('chat', (data) => {
    feedback.innerHTML = "";
    if(data.userID == userID.value){
      output.innerHTML += '<li class="clearfix" id="last">' +
        '<div class="message-data ">' + 
          '<i class="fa fa-circle online"></i> <span class="message-data-name" >'+ data.handle +'</span>' +
        '</div>' +
        '<div class="message my-message">' + data.message + '</div>'+
      '</li>';
    }else{
      output.innerHTML += '<li class="clearfix" id="last">' +
        '<div class="message-data align-right">' + 
          '<span class="message-data-name" >'+ data.handle +'</span> <i class="fa fa-circle other"></i> ' +
        '</div>' +
        '<div class="message other-message float-right">' + data.message + '</div>'+
      '</li>';
    }
    document.getElementById('link').click();

});

socket.on('typing', (data) => {
  feedback.innerHTML = '<i class="fa fa-circle online"></i>' +
  '<i class="fa fa-circle online" style="color: #AED2A6"></i> ' +
  '<i class="fa fa-circle online" style="color:#DAE9DA"></i> &nbsp;' + data + ' is typing...';
});

