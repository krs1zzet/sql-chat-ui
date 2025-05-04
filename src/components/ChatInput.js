import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <TextareaAutosize
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Send a message..."
        className="chat-input"
        maxRows={5}
      />
      <div className="input-footer">
        Free Research Preview. ChatGPT may produce inaccurate information.
      </div>
    </form>
  );
}

export default ChatInput; 