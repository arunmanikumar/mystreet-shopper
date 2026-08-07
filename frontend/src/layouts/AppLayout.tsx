import { Outlet } from 'react-router-dom';
import { Navigation } from '../components/Navigation';

export function AppLayout() {
  return (
    <div className="app-shell">
      <Navigation />
      <div className="route-frame">
        <Outlet />
      </div>
    </div>
  );
}