// Fetch session data from the server
fetch('/session-data')
.then(response => response.json())
.then(data => {
    if (data.isAuth) {
      document.getElementById('1-entry').href = '/settings';
      document.getElementById('1-entry').textContent = 'User';
      
      document.getElementById('username').textContent = data.username;
      document.getElementById('bio').textContent = data.bio;

    } else {
      document.getElementById('1-entry').href = '/signup';
      document.getElementById('1-entry').textContent = 'Signup';

      var entry = document.createElement('a');
      entry.id ='log-entry';
      entry.href = '/login';
      entry.textContent = 'Login';
      document.getElementById('nav-link').append(entry);
      if(data.msgToUser != false){
        document.getElementById('msgToUser').textContent = data.msgToUser;
      }
    }
});

