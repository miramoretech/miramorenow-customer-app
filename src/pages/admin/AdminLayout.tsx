import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#f6f7f9' }}>
      {/* You can add a simple admin header/sidebar here later */}
      <Outlet />
    </div>
  );
}