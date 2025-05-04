import React from 'react';

function ChatMessage({ message }) {
  // Eğer sender mevcut kullanıcı ise user-message, değilse assistant-message
  // Varsayım: sender email ise ve localStorage'daki user.email ile eşleşiyorsa user-message
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isUser = currentUser && message.sender === currentUser.email;

  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-content">
        <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 2 }}>{message.sender}</div>
        {message.content}
      </div>
    </div>
  );
}

export default ChatMessage; 