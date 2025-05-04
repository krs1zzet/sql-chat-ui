import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './styles/auth.css';
import './App.css';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { getChats, createChat } from './api/chatApi';
import { getChatMessages, createChatMessage } from './api/chatMessageApi';

function App() {
  // Kullanıcı durumunu localStorage'dan al
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Kullanıcı değiştiğinde chatleri backend'den çek
  useEffect(() => {
    if (user) {
      getChats(user.id)
        .then(res => {
          setChats(res.data);
          if (res.data.length > 0) {
            setCurrentChatId(res.data[0].id);
          }
        })
        .catch(() => setChats([]));
    } else {
      setChats([]);
      setCurrentChatId(null);
    }
  }, [user]);

  // Seçili chat değiştiğinde mesajları backend'den çek
  useEffect(() => {
    if (currentChatId) {
      getChatMessages(currentChatId)
        .then(res => {
          // Mesajları createdAt'e göre sırala, aynı createdAt varsa sender'a göre sırala
          const sorted = [...res.data].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            // Eğer aynı zaman ise sender'a göre sırala
            if (a.sender < b.sender) return -1;
            if (a.sender > b.sender) return 1;
            return 0;
          });
          setMessages(sorted);
        })
        .catch(() => setMessages([]));
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  // Kullanıcı durumu değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Chat seçimini düzgün yönet
  const handleSelectChat = (chatId) => {
    setMessages([]); // Eski mesajları hemen temizle
    setCurrentChatId(chatId);
  };

  // Yeni chat oluştur
  const handleNewChat = async () => {
    if (!user) return;
    const chatTitle = window.prompt('Yeni chat başlığı girin:');
    if (!chatTitle || !chatTitle.trim()) return;
    try {
      const res = await createChat(chatTitle.trim(), user.id);
      // Chat listesini tekrar fetch et
      const chatsRes = await getChats(user.id);
      setChats(chatsRes.data);
      setCurrentChatId(res.data.id); // Yeni chat'i seçili yap
      setMessages([]);
    } catch (err) {
      alert('Chat oluşturulamadı!');
    }
  };

  // Mesaj gönder
  const handleSendMessage = async (message) => {
    if (!user || !currentChatId) return;
    const newMessage = {
      sender: user.email,
      content: message,
      chatId: currentChatId,
      promptSettingId: 1 // Gerekirse değiştir
    };
    try {
      await createChatMessage(newMessage);
      // Mesajı gönderdikten sonra tekrar mesajları çek
      const res = await getChatMessages(currentChatId);
      // Mesajları createdAt ve sender'a göre sırala
      const sorted = [...res.data].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        if (a.sender < b.sender) return -1;
        if (a.sender > b.sender) return 1;
        return 0;
      });
      setMessages(sorted);
    } catch (err) {
      alert('Mesaj gönderilemedi!');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage onLogin={setUser} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={
            user ? (
              <div className="app">
                <aside className="sidebar">
                  <div className="new-chat">
                    <button onClick={handleNewChat}>+ New chat</button>
                  </div>
                  <nav className="chat-history">
                    {chats.map(chat => (
                      <button
                        key={chat.id}
                        className={`chat-button ${currentChatId === chat.id ? 'active' : ''}`}
                        onClick={() => handleSelectChat(chat.id)}
                      >
                        {chat.chatTitle}
                      </button>
                    ))}
                  </nav>
                  <button onClick={handleLogout} className="logout-button" style={{marginTop: 'auto'}}>Çıkış Yap</button>
                </aside>

                <main className="main">
                  <div className="chat-container">
                    {messages.map((message, index) => (
                      <ChatMessage key={index} message={message} />
                    ))}
                  </div>
                  <div className="input-container">
                    <ChatInput onSendMessage={handleSendMessage} />
                  </div>
                </main>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
