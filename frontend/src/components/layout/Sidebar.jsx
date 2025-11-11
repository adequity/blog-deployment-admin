import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUserCircle,
  faWallet,
  faCog,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ isOpen, onClose }) => {
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
        <div className="p-6 border-b border-gray-200 flex justify-center">
          {/* Custom B + WiFi Logo */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gradient definition */}
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>

            {/* Background circle */}
            <circle cx="24" cy="24" r="22" fill="url(#logoGradient)" opacity="0.1" />

            {/* WiFi waves (deployment signal) - smooth curves */}
            <circle cx="24" cy="30" r="2.5" fill="url(#logoGradient)" />
            <path
              d="M18 25C19.5 23 21.5 22 24 22C26.5 22 28.5 23 30 25"
              stroke="url(#logoGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M14 20C16.5 17 19.5 15 24 15C28.5 15 31.5 17 34 20"
              stroke="url(#logoGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.6"
            />

            {/* Letter B - integrated design */}
            <path
              d="M20 8 L20 14 L24 14 C26 14 27 13 27 11 C27 9 26 8 24 8 L20 8 Z M20 14 L20 20 L25 20 C27 20 28 19 28 17 C28 15 27 14 25 14 L20 14 Z"
              fill="url(#logoGradient)"
            />
          </svg>
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
      </aside>
    </>
  );
};

export default Sidebar;
