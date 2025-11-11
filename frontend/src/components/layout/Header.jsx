import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faBell,
  faSearch,
  faChevronDown,
  faCog,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const handleSettings = () => {
    navigate('/settings');
    setDropdownOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left: Menu Button (Mobile) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="블로그 계정 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-indigo focus:border-transparent"
            />
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative text-gray-600 hover:text-gray-900">
            <FontAwesomeIcon icon={faBell} size="lg" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                {user?.username || '사용자'}
              </span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`text-gray-500 text-xs transition-transform ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {/* User Info */}
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username || '사용자'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                </div>

                {/* Menu Items */}
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faCog} className="text-gray-500" />
                  <span>설정</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-gray-500" />
                  <span>로그아웃</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
