import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
}