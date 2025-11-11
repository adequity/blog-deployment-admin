import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUserCircle,
  faWallet,
  faCog,
  faSignOutAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: faHome, label: '대시보드' },
    { path: '/accounts', icon: faUserCircle, label: '계정 관리' },
    { path: '/revenue', icon: faWallet, label: '수익 관리' },
    { path: '/settings', icon: faCog, label: '설정' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden text-gray-500 hover:text-gray-700"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold gradient-text">
            📝 Blog System
          </h1>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.username || '사용자'}
            </p>
            <p className="text-xs text-gray-500">{user?.email || ''}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
