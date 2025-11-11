import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-5xl">📝</span>
            <h1 className="text-4xl font-bold text-white">
              Blog System
            </h1>
          </div>
          <p className="text-indigo-100">블로그 배포 통합 관리 시스템</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
