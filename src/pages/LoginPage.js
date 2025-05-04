// src/pages/LoginPage.js
import React, { useState } from 'react';
import { getUserByEmail } from '../api/userApi';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log('Giriş denemesi:', email);
      const res = await getUserByEmail(email);
      console.log('API yanıtı:', res);
      const user = res.data;
      
      // Backend şifre döndürmediği için, sadece email eşleşmesine bakıyoruz
      if (user) {
        // Kullanıcı bulundu, giriş yapabilir
        onLogin(user);
      } else {
        setError('Kullanıcı bulunamadı');
      }
    } catch (err) {
      console.error('Giriş hatası:', err);
      console.error('Hata detayları:', err.response?.data);
      
      if (err.response?.status === 400) {
        setError('Geçersiz istek. Lütfen email adresinizi kontrol edin.');
      } else if (err.response?.status === 404) {
        setError('Kullanıcı bulunamadı.');
      } else {
        setError(`Giriş hatası: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            placeholder="Email adresiniz"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Şifre:</label>
          <input
            id="password"
            type="password"
            placeholder="Şifreniz"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
        {error && <div className="error-message">{error}</div>}
      </form>
      <div className="register-link">
        <p>Hesabınız yok mu?</p>
        <button onClick={handleRegisterClick} className="register-button">
          Kayıt Ol
        </button>
      </div>
    </div>
  );
}

export default LoginPage;