// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { createUser } from '../api/userApi';

function RegisterPage({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Şifre kontrolü
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    try {
      await createUser({ email, password });
      setSuccess('Kayıt başarılı! Giriş yapabilirsiniz.');
      // Formu temizle
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      onRegister && onRegister();
    } catch (err) {
      setError('Kayıt başarısız: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="register-container">
      <h2>Kayıt Ol</h2>
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Şifre Tekrar:</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Şifrenizi tekrar girin"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Kayıt Ol</button>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>
    </div>
  );
}

export default RegisterPage;