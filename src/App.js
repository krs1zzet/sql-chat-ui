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
import { createDatabase, getChatDatabase } from './api/DatabaseApi';
import { getPromptSetting, createPromptSetting } from './api/promptSettingApi';

function App() {
  // Kullanıcı durumunu localStorage'dan al
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [schemaInfo, setSchemaInfo] = useState(null);
  const [promptSettings, setPromptSettings] = useState([]);
  const [promptSetting, setPromptSetting] = useState(null);
  const [showPromptForm, setShowPromptForm] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ technique: '', nValue: '', examples: '', model: '' });
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState('');
  const [nValue, setNValue] = useState('');
  const [examples, setExamples] = useState('');
  const modelOptions = ['gpt-3.5-turbo', 'gpt-4', 'example model'];
  const techniqueOptions = ['zero-shot prompting', 'few-shot prompting', 'n-shot prompting'];

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

  // Seçili chat değiştiğinde mesajları ve schema bilgisini backend'den çek
  useEffect(() => {
    if (currentChatId) {
      // Mesajları çek
      getChatMessages(currentChatId)
        .then(res => {
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
        })
        .catch(() => setMessages([]));
      // Schema bilgisini çek
      setSchemaInfo(null);
      getChatDatabase(currentChatId)
        .then(res => {
          console.log('getChatDatabase response:', res.data);
          if (res.data && res.data.length > 0) {
            setSchemaInfo(res.data[0]);
          } else {
            setSchemaInfo(null);
          }
        })
        .catch(() => setSchemaInfo(null));
    } else {
      setMessages([]);
      setSchemaInfo(null);
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

  // Fetch all prompt settings on mount
  useEffect(() => {
    getPromptSetting()
      .then(res => {
        setPromptSettings(res.data);
        if (res.data.length > 0) setPromptSetting(res.data[0]);
      })
      .catch(() => setPromptSettings([]));
  }, []);

  // Chat seçimini düzgün yönet
  const handleSelectChat = (chatId) => {
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
    if (!promptSetting) {
      alert('Please create/select a prompt setting first!');
      return;
    }
    const newMessage = {
      sender: user.email,
      content: message,
      chatId: currentChatId,
      promptSettingId: promptSetting.id
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

  // Schema ekleme fonksiyonu
  const handleAddSchema = async (chatId) => {
    if (schemaInfo) {
      // Schema varsa, içeriğini göster
      alert(`Schema:\n${schemaInfo.schemaText}\n\nData:\n${schemaInfo.dataText}`);
      return;
    }
    const schemaText = window.prompt('Schema SQL kodunu girin:');
    if (!schemaText || !schemaText.trim()) return;
    const dataText = window.prompt('Data insert SQL kodunu girin:');
    if (!dataText || !dataText.trim()) return;
    try {
      await createDatabase({ schemaText: schemaText.trim(), dataText: dataText.trim(), chatId });
      setSchemaInfo({ schemaText: schemaText.trim(), dataText: dataText.trim() });
      alert('Schema başarıyla eklendi!');
    } catch (err) {
      alert('Schema eklenemedi!');
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

                <main className="main" style={{ display: 'flex', flexDirection: 'column', height: '100vh', minHeight: 0 }}>
                  {/* Üstte model seçici */}
                  <div style={{ background: 'rgba(52,53,65,0.85)', borderRadius: 8, padding: '6px 14px', color: '#ececf1', boxShadow: '0 2px 8px #0002', display: 'flex', alignItems: 'center', gap: 8, margin: 16, alignSelf: 'flex-start' }}>
                    <label htmlFor="model-select" style={{ fontWeight: 500, color: '#ececf1', marginRight: 4, fontSize: 15 }}>Model:</label>
                    <select
                      id="model-select"
                      value={selectedModel}
                      onChange={e => setSelectedModel(e.target.value)}
                      style={{ minWidth: 120, borderRadius: 6, padding: '4px 10px', background: 'rgba(32,33,35,0.95)', color: '#ececf1', border: '1px solid #444', fontSize: 15, outline: 'none' }}
                    >
                      <option value="">Model Seç</option>
                      {modelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  {/* Ortada chat mesajları alanı */}
                  <div className="chat-container" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '0 0 0 0' }}>
                    {messages.map((message, index) => (
                      <ChatMessage key={index} message={message} />
                    ))}
                  </div>
                  {/* Altta prompt menüleri ve chat inputu */}
                  <div className="input-container" style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 8, width: '100%', background: 'var(--color-secondary)', zIndex: 10, paddingTop: 12, paddingBottom: 16, borderTop: '1px solid var(--color-accent)' }}>
                    {/* Prompt tekniği seçici */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'flex-start', marginBottom: 2 }}>
                      <label htmlFor="technique-select" style={{ color: '#ececf1', fontWeight: 500, fontSize: 15, marginRight: 4 }}>Teknik:</label>
                      <select
                        id="technique-select"
                        value={selectedTechnique}
                        onChange={e => {
                          setSelectedTechnique(e.target.value);
                          if (e.target.value !== 'n-shot prompting') {
                            setNValue('');
                            setExamples('');
                          }
                        }}
                        style={{ minWidth: 140, borderRadius: 6, padding: '4px 10px', background: 'rgba(52,53,65,0.85)', color: '#ececf1', border: '1px solid #444', fontSize: 15, outline: 'none' }}
                      >
                        <option value="">Teknik Seç</option>
                        {techniqueOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      {selectedTechnique === 'n-shot prompting' && (
                        <>
                          <input
                            type="number"
                            min={1}
                            placeholder="n"
                            value={nValue}
                            onChange={e => setNValue(e.target.value)}
                            style={{ width: 50, borderRadius: 6, padding: '4px 8px', border: '1px solid #444', background: 'rgba(52,53,65,0.85)', color: '#ececf1', fontSize: 15, marginLeft: 6 }}
                          />
                          <input
                            type="text"
                            placeholder="Örnekler"
                            value={examples}
                            onChange={e => setExamples(e.target.value)}
                            style={{ minWidth: 100, borderRadius: 6, padding: '4px 8px', border: '1px solid #444', background: 'rgba(52,53,65,0.85)', color: '#ececf1', fontSize: 15, marginLeft: 6 }}
                          />
                        </>
                      )}
                    </div>
                    {/* Prompt tekniği ve n/örnekler etiketleri */}
                    <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start', marginBottom: 4 }}>
                      {selectedTechnique && (
                        <span style={{ background: 'rgba(52,53,65,0.85)', color: '#ececf1', borderRadius: 20, padding: '4px 14px', fontSize: 15, border: '1px solid #444', fontWeight: 500 }}>
                          {selectedTechnique}
                        </span>
                      )}
                      {selectedTechnique === 'n-shot prompting' && nValue && (
                        <span style={{ background: 'rgba(52,53,65,0.85)', color: '#ececf1', borderRadius: 20, padding: '4px 14px', fontSize: 15, border: '1px solid #444', fontWeight: 500 }}>
                          n: {nValue}
                        </span>
                      )}
                      {selectedTechnique === 'n-shot prompting' && examples && (
                        <span style={{ background: 'rgba(52,53,65,0.85)', color: '#ececf1', borderRadius: 20, padding: '4px 14px', fontSize: 15, border: '1px solid #444', fontWeight: 500 }}>
                          Örnekler: {examples}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={{ flex: 1 }}>
                        <ChatInput onSendMessage={handleSendMessage} />
                      </div>
                      {currentChatId && (
                        <button
                          className={`schema-add-button${schemaInfo ? ' schema-added' : ''}`}
                          style={{ marginLeft: 8, padding: '0 12px', fontSize: 16, height: 36, minWidth: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={() => handleAddSchema(currentChatId)}
                          title={schemaInfo ? 'Eklenen schema ve datayı görüntüle' : 'Bu sohbete schema ekle'}
                          disabled={!!schemaInfo}
                        >
                          {schemaInfo ? '✓' : '+'}
                        </button>
                      )}
                    </div>
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
