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
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          {/* Custom B + WiFi Logo */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* WiFi waves (deployment signal) */}
            <path
              d="M20 28C21.1046 28 22 27.1046 22 26C22 24.8954 21.1046 24 20 24C18.8954 24 18 24.8954 18 26C18 27.1046 18.8954 28 20 28Z"
              fill="#4F46E5"
            />
            <path
              d="M15 22C16.3261 20.2348 18.087 19 20 19C21.913 19 23.6739 20.2348 25 22"
              stroke="#4F46E5"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M11 18C13.6522 14.6667 16.7391 13 20 13C23.2609 13 26.3478 14.6667 29 18"
              stroke="#4F46E5"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Letter B */}
            <text
              x="20"
              y="12"
              fontSize="16"
              fontWeight="bold"
              fill="#4F46E5"
              textAnchor="middle"
            >
              B
            </text>
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
