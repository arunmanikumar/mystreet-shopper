import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Navigation() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">MyStreet Shoppers</p>
        <h1>Local sneaker storefront</h1>
      </div>

      <nav className="topnav" aria-label="Primary">
        <NavLink to="/">Home</NavLink>
        {!isAuthenticated ? <NavLink to="/login">Login</NavLink> : null}
        {!isAuthenticated ? <NavLink to="/register">Sign up</NavLink> : null}
        {user ? <span className="user-chip">Hi, {user.firstName}</span> : null}
        {isAuthenticated ? <button type="button" onClick={() => void handleLogout()}>Logout</button> : null}
      </nav>
    </header>
  );
}