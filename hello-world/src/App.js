import { useState } from 'react';
import { login, logout } from './auth';
import ProductList from './ProductList';
import './App.css';

const USE_AUTH = process.env.REACT_APP_USE_AUTH === 'true';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(!USE_AUTH || !!localStorage.getItem('id_token'));
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      setLoggedIn(true);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    logout();
    setLoggedIn(false);
  }

  if (!loggedIn) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h2>Welcome back</h2>
          <p>Sign in to your account</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button className="btn-primary btn-block" type="submit">Sign In</button>
            {error && <p className="error-msg">{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <span className="navbar-brand">Hello World Inventory</span>
        {USE_AUTH && <button onClick={handleLogout}>Sign Out</button>}
      </nav>
      <main className="main">
        <ProductList />
      </main>
    </div>
  );
}

export default App;
