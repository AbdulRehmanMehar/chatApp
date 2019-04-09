
let userElement = document.querySelector('#users');

let messageElement = document.querySelector('#messages');
let cuser = document.querySelector('meta[name="user"]').attributes['content'].value;

let socket = io.connect(window.location.host);
socket.on('connect', () => {
  socket.on('users', users => {
    users.map(user => {
      if(user.uid != cuser){
        let name = user.user.name;
        let photo = user.user.photo;
        let child = document.getElementById(user.uid);
        if(!userElement.contains(child)) {
            userElement.innerHTML += `
              <div id="${user.uid}" uphoto="${photo}" uname="${name}" class="mt-1 mb-1 user" onclick="setReciever(this)">
                <div class="bg" style="background-image: url(${photo}); float: left; margin-right: 10px;"></div>
                <div>
                  <span>${name}</span>
                </div>
              </div>
            `;
        }
      }
    })
  });

  socket.on('message', (data) => {
    messageElement.innerHTML += ` 
      <div class="message recieved"><span class="data">${data.message}<span></div> 
    `;
    messageElement.scrollTop = messageElement.scrollHeight - messageElement.clientHeight;
  });

});


let setReciever = (event) => {
  let ref = document.getElementById(event.id);
  let reciever = document.querySelector('#message-to');
  reciever.value = event.id;
  userElement.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
  document.getElementById(event.id).classList.add('active');
  document.getElementById('current-user-name').innerHTML = ref.attributes.uname.value;
  document.getElementById('current-user-bg').style.backgroundImage = `url(${ref.attributes.uphoto.value})`;
}

let sendMessage = (event) => {
  let msg = document.querySelector('#text-message');
  let reciever = document.querySelector('#message-to');
  let data = {
    to: reciever.value,
    message: msg.value,
  };
  if(!data.to || !data.message){
    event.preventDefault();
    return alert('Please select user and write message.');
  }
  socket.emit('message', data);
  messageElement.innerHTML += `
    <div class="message"><span class="data">${data.message}</span></div> 
  `;
  messageElement.scrollTop = messageElement.scrollHeight - messageElement.clientHeight;
  msg.value = '';
  event.preventDefault();
}