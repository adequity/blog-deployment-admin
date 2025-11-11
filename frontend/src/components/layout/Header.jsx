import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

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

          {/* Profile */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden lg:inline">
              {user?.username || '사용자'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
