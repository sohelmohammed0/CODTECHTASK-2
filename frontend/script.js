document.addEventListener('DOMContentLoaded', () => {
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    setTimeout(() => {
      welcomeOverlay.classList.add('animate__fadeOut');
      setTimeout(() => {
        welcomeOverlay.style.display = 'none';
      }, 1000);
    }, 2000);

    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
    });

    const username = user.username;
    socket.emit('userConnected', username);

    function showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `toast ${type} animate__animated animate__fadeInDown`;
      toast.innerHTML = `
        <div class="toast-content">
          <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
          <span>${message}</span>
        </div>
      `;
      document.getElementById('toast-container').appendChild(toast);

      setTimeout(() => {
        toast.classList.replace('animate__fadeInDown', 'animate__fadeOutUp');
        setTimeout(() => toast.remove(), 1000);
      }, 3000);
    }

    const logoutBtn = document.getElementById('logout-btn');
    const searchInput = document.getElementById('search-input');
    const userList = document.getElementById('user-list');
    const friendRequestsList = document.getElementById('friend-requests');
    const friendsDot = document.getElementById('friends-dot');
    const requestsDot = document.getElementById('requests-dot');

    logoutBtn.addEventListener('click', async () => {
      try {
        socket.emit('logout', username);

        const response = await fetch('http://localhost:5000/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });

        if (!response.ok) {
          throw new Error('Logout failed');
        }

        document.querySelectorAll('.chat-popup').forEach(popup => popup.remove());
        sessionStorage.removeItem('user');

        showToast('Logged out successfully', 'success');

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000);

      } catch (error) {
        console.error('Logout error:', error);
        showToast('Error during logout. Redirecting...', 'error');
        sessionStorage.removeItem('user');
        window.location.href = 'login.html';
      }
    });

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      if (query) {
        socket.emit('searchUsers', query);
      } else {
        userList.innerHTML = '';
      }
    });

    function openChatPopup(friendName) {
      let existingPopup = document.querySelector(`.chat-popup[data-friend="${friendName}"]`);
      if (existingPopup) {
        existingPopup.classList.remove('hidden');
        return;
      }

      const chatPopupTemplate = document.getElementById('chat-popup-template');
      const chatPopup = chatPopupTemplate.cloneNode(true);
      chatPopup.id = '';
      chatPopup.classList.remove('hidden');
      chatPopup.setAttribute('data-friend', friendName);
      chatPopup.querySelector('.chat-popup-name').textContent = friendName;

      const room = [username, friendName].sort().join('-');
      socket.emit('joinRoom', room);

      const popupSendBtn = chatPopup.querySelector('.popup-send-btn');
      const popupMessageInput = chatPopup.querySelector('.popup-message');
      const popupChatBox = chatPopup.querySelector('.chat-popup-box');
      const closePopupBtn = chatPopup.querySelector('.close-popup-btn');

      closePopupBtn.addEventListener('click', () => {
        document.body.removeChild(chatPopup);
        socket.emit('leaveRoom', room);
      });

      function sendMessage() {
        const message = popupMessageInput.value.trim();
        if (message) {
          const timestamp = new Date().toISOString();
          socket.emit('sendMessage', { room, message, sender: username, timestamp });
          console.log('Message sent:', { room, message, sender: username, timestamp });
          popupMessageInput.value = '';
        }
      }

      popupSendBtn.addEventListener('click', sendMessage);
      popupMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });

      socket.on(`receiveMessage-${room}`, (data) => {
        console.log('Message received:', data);
        appendMessage(popupChatBox, data);
        friendsDot.classList.remove('hidden');  // Show notification dot for new message
      });

      document.body.appendChild(chatPopup);

      socket.emit('getChatHistory', room, (messages) => {
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        popupChatBox.innerHTML = '';
        messages.forEach((message) => appendMessage(popupChatBox, message));
      });
    }

    socket.on('searchResults', (results) => {
      userList.innerHTML = '';
      if (results.length > 0) {
        results.forEach(({ username, status, isFriend }) => {
          if (username !== user.username) {
            const li = document.createElement('li');
            li.innerHTML = `<span>${username}</span>`;
            li.className = status === 'online' ? 'online' : 'offline';
            if (!isFriend) {
              li.innerHTML += `<button class="add-btn modern-btn">Add</button>`;
              li.querySelector('.add-btn').addEventListener('click', () => {
                console.log(`Sending friend request from ${user.username} to ${username}`);
                socket.emit('sendFriendRequest', { from: user.username, to: username });
              });
            } else {
              li.innerHTML += `<button class="message-btn modern-btn" data-friend="${username}">Message</button>`;
            }
            userList.appendChild(li);
          }
        });
      } else {
        const noUsers = document.createElement('li');
        noUsers.innerHTML = 'No users found';
        noUsers.className = 'no-users';
        userList.appendChild(noUsers);
      }
    });

    function updateUserList() {
      socket.emit('getUserFriends', { username }, (friends) => {
        userList.innerHTML = '';
        friends.forEach(({ username, status }) => {
          if (username !== user.username) {
            const li = document.createElement('li');
            li.innerHTML = `
              <span>${username}</span>
              <button class="message-btn modern-btn" data-friend="${username}">Message</button>
              <button class="unfriend-btn modern-btn">Unfriend</button>
            `;
            li.className = status === 'online' ? 'online' : 'offline';
            li.querySelector('.message-btn').addEventListener('click', () => {
              li.querySelector('.message-btn').classList.remove('new-message');
              openChatPopup(username);
              friendsDot.classList.add('hidden');  // Hide notification dot when checking messages
            });
            li.querySelector('.unfriend-btn').addEventListener('click', () => {
              socket.emit('unfriend', { from: user.username, to: username });
            });
            userList.appendChild(li);
          }
        });
      });
    }

    socket.on('friendRequestReceived', ({ from }) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${from}</span>
        <button class="accept-btn modern-btn">Accept</button>
      `;
      li.querySelector('.accept-btn').addEventListener('click', () => {
        socket.emit('acceptFriendRequest', { from, to: username });
        friendRequestsList.removeChild(li);
        requestsDot.classList.add('hidden');  // Hide notification dot when checking requests
      });
      friendRequestsList.appendChild(li);
      requestsDot.classList.remove('hidden');  // Show notification dot for new friend request
    });

    socket.on('friendRequestAccepted', ({ from }) => {
      alert(`You are now friends with ${from}`);
      updateUserList();
    });

    socket.on('friendListUpdated', updateUserList);
    socket.on('messageNotification', ({ from }) => {
      const messageBtn = document.querySelector(`.message-btn[data-friend="${from}"]`);
      if (messageBtn) {
        messageBtn.classList.add('new-message');
        friendsDot.classList.remove('hidden');  // Show notification dot for new message
      }
    });

    document.querySelectorAll('.tab-btn').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        tabBtn.classList.add('active');
        const tab = tabBtn.getAttribute('data-tab');
        if (tab === 'friends') {
          document.getElementById('user-list').classList.remove('hidden');
          document.getElementById('friend-requests').classList.add('hidden');
          friendsDot.classList.add('hidden');  // Hide notification dot when checking friends tab
        } else {
          document.getElementById('user-list').classList.add('hidden');
          document.getElementById('friend-requests').classList.remove('hidden');
          requestsDot.classList.add('hidden');  // Hide notification dot when checking requests tab
        }
      });
    });

    updateUserList();
  });

  function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  function appendMessage(container, { sender, message, timestamp }) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-bubble';
    messageDiv.classList.add(sender === JSON.parse(sessionStorage.getItem('user')).username ? 'user' : 'other');
    messageDiv.innerHTML = `
      <div class="message-info">
        <span class="message-sender">${sender}</span>
        <span class="message-timestamp">${new Date(timestamp).toLocaleTimeString()}</span>
      </div>
      <div class="message-text">${message}</div>
    `;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
  }