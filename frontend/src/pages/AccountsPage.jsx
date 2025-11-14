import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle,
  faCheckCircle,
  faSync,
  faWallet,
  faSearch,
  faFilter,
  faPlus,
  faEllipsisV,
  faEdit,
  faTrash,
  faEye,
  faPowerOff,
  faExternalLinkAlt,
  faExclamationTriangle,
  faTimes,
  faCheck,
  faSpinner,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const AccountsPage = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSyncStatus, setFilterSyncStatus] = useState('all');
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

  // Platform colors
  const platformColors = {
    naver: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', icon: '🟢' },
    tistory: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', icon: '🟠' },
    velog: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', icon: '🟣' },
    brunch: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: '🔵' },
  };

  // Sync status styles
  const syncStatusStyles = {
    success: { bg: 'bg-green-100', text: 'text-green-700', icon: faCheckCircle, label: '동기화 완료' },
    syncing: { bg: 'bg-orange-100', text: 'text-orange-700', icon: faSpinner, label: '동기화 중' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', icon: faExclamationTriangle, label: '동기화 실패' },
    pending: { bg: 'bg-gray-100', text: 'text-gray-700', icon: faClock, label: '대기 중' },
  };

  useEffect(() => {
    fetchAccounts();
    fetchPlatforms();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/blog-accounts');
      setAccounts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      // Set mock data for development
      setAccounts([
        {
          id: 1,
          platformId: 1,
          platform: { name: 'naver', displayName: '네이버 블로그' },
          accountName: '내 블로그',
          url: 'https://blog.naver.com/myaccount',
          isActive: true,
          syncStatus: 'success',
          lastSyncedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          postCount: 45,
          dailyRevenue: 12500,
          weeklyRevenue: 87500,
          monthlyRevenue: 350000,
        },
        {
          id: 2,
          platformId: 2,
          platform: { name: 'tistory', displayName: '티스토리' },
          accountName: '테크 블로그',
          url: 'https://techblog.tistory.com',
          isActive: true,
          syncStatus: 'failed',
          syncErrorMessage: '인증이 만료되었습니다. 비밀번호를 확인하세요.',
          lastSyncedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          postCount: 128,
          dailyRevenue: 23000,
          weeklyRevenue: 161000,
          monthlyRevenue: 580000,
        },
        {
          id: 3,
          platformId: 3,
          platform: { name: 'velog', displayName: '벨로그' },
          accountName: '개발일지',
          url: 'https://velog.io/@mydevlog',
          isActive: true,
          syncStatus: 'syncing',
          lastSyncedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          postCount: 67,
          dailyRevenue: 8500,
          weeklyRevenue: 59500,
          monthlyRevenue: 210000,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const response = await api.get('/platforms');
      setPlatforms(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
      // Set mock platforms
      setPlatforms([
        { id: 1, name: 'naver', displayName: '네이버 블로그' },
        { id: 2, name: 'tistory', displayName: '티스토리' },
        { id: 3, name: 'velog', displayName: '벨로그' },
        { id: 4, name: 'brunch', displayName: '브런치' },
      ]);
    }
  };

  const handleSync = async (accountId) => {
    try {
      await api.post(`/blog-accounts/${accountId}/sync`);
      alert('동기화를 시작했습니다.');
      await fetchAccounts();
    } catch (error) {
      console.error('Failed to sync account:', error);
      alert(error.response?.data?.message || '동기화에 실패했습니다.');
    }
  };

  const handleToggleActive = async (accountId, isActive) => {
    try {
      await api.patch(`/blog-accounts/${accountId}/toggle`, { isActive: !isActive });
      alert(`계정이 ${!isActive ? '활성화' : '비활성화'}되었습니다.`);
      await fetchAccounts();
    } catch (error) {
      console.error('Failed to toggle account:', error);
      alert(error.response?.data?.message || '상태 변경에 실패했습니다.');
    }
  };

  const openDetailModal = (account) => {
    setSelectedAccount(account);
    setShowDetailModal(true);
    setShowActionMenu(null);
  };

  const openEditModal = (account) => {
    setSelectedAccount(account);
    setShowEditModal(true);
    setShowActionMenu(null);
  };

  const openDeleteModal = (account) => {
    setSelectedAccount(account);
    setShowDeleteModal(true);
    setShowActionMenu(null);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/blog-accounts/${selectedAccount.id}`);
      alert('계정이 삭제되었습니다.');
      setShowDeleteModal(false);
      await fetchAccounts();
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert(error.response?.data?.message || '계정 삭제에 실패했습니다.');
    }
  };

  const formatRevenue = (amount) => {
    if (amount >= 1000000) {
      return `₩${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₩${(amount / 1000).toFixed(0)}K`;
    }
    return `₩${amount.toLocaleString()}`;
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return '방금 전';
    if (diffInMins < 60) return `${diffInMins}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    return `${diffInDays}일 전`;
  };

  // Filtered accounts
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.platform?.displayName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlatform =
      filterPlatform === 'all' || account.platform?.name === filterPlatform;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && account.isActive) ||
      (filterStatus === 'inactive' && !account.isActive);

    const matchesSyncStatus =
      filterSyncStatus === 'all' || account.syncStatus === filterSyncStatus;

    return matchesSearch && matchesPlatform && matchesStatus && matchesSyncStatus;
  });

  // Statistics
  const stats = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter((a) => a.isActive).length,
    syncingAccounts: accounts.filter((a) => a.syncStatus === 'syncing').length,
    totalMonthlyRevenue: accounts.reduce((sum, a) => sum + (a.monthlyRevenue || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">계정 관리</h1>
          <p className="mt-1 text-sm text-gray-600">블로그 플랫폼 계정을 관리하고 수익을 추적하세요</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          계정 추가
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">총 계정</span>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUserCircle} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalAccounts}</p>
        </div>

        <div className="card border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">활성 계정</span>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activeAccounts}</p>
        </div>

        <div className="card border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">동기화 중</span>
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faSync} className="text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.syncingAccounts}</p>
        </div>

        <div className="card border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">월 수익</span>
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faWallet} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatRevenue(stats.totalMonthlyRevenue)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="계정명, URL, 플랫폼 검색..."
              className="w-full pl-10 pr-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Platform Filter */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faFilter}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="pl-10 pr-8 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
            >
              <option value="all">전체 플랫폼</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.name}>
                  {platform.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-4 pr-8 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white min-w-[120px]"
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>

          {/* Sync Status Filter */}
          <div className="relative">
            <select
              value={filterSyncStatus}
              onChange={(e) => setFilterSyncStatus(e.target.value)}
              className="pl-4 pr-8 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white min-w-[140px]"
            >
              <option value="all">전체 동기화</option>
              <option value="success">성공</option>
              <option value="syncing">진행중</option>
              <option value="failed">실패</option>
              <option value="pending">대기중</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1 rounded ${
                viewMode === 'card'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              카드
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              테이블
            </button>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      {loading ? (
        <div className="card">
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="card">
          <div className="text-center py-12 text-gray-500">
            {searchTerm || filterPlatform !== 'all' || filterStatus !== 'all'
              ? '검색 결과가 없습니다.'
              : '등록된 계정이 없습니다. 계정을 추가해주세요.'}
          </div>
        </div>
      ) : viewMode === 'card' ? (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => {
            const platformColor = platformColors[account.platform?.name] || platformColors.naver;
            const syncStyle = syncStatusStyles[account.syncStatus] || syncStatusStyles.pending;

            return (
              <div
                key={account.id}
                className={`card border-2 ${platformColor.border} hover:shadow-lg transition-all duration-200`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl ${platformColor.text}`}>
                      {platformColor.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900">
                        {account.accountName || '이름 없음'}
                      </h3>
                      <p className={`text-xs ${platformColor.text} font-medium`}>
                        {account.platform?.displayName}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowActionMenu(showActionMenu === account.id ? null : account.id)
                      }
                      className="text-gray-400 hover:text-gray-600 p-2"
                    >
                      <FontAwesomeIcon icon={faEllipsisV} />
                    </button>
                    {showActionMenu === account.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={() => openDetailModal(account)}
                          className="w-full px-4 py-2 text-left text-sm text-indigo-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faEye} />
                          상세보기
                        </button>
                        <button
                          onClick={() => handleSync(account.id)}
                          className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faSync} />
                          수동 동기화
                        </button>
                        <button
                          onClick={() => openEditModal(account)}
                          className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          수정
                        </button>
                        <button
                          onClick={() => handleToggleActive(account.id, account.isActive)}
                          className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faPowerOff} />
                          {account.isActive ? '비활성화' : '활성화'}
                        </button>
                        <button
                          onClick={() => openDeleteModal(account)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2 border-t"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* URL */}
                <a
                  href={account.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-1 mb-3"
                >
                  {account.url}
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                </a>

                {/* Divider */}
                <div className="border-t border-gray-200 my-3"></div>

                {/* Sync Status */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${syncStyle.bg} ${syncStyle.text}`}
                      >
                        <FontAwesomeIcon
                          icon={syncStyle.icon}
                          className={account.syncStatus === 'syncing' ? 'fa-spin' : ''}
                        />
                        <span className="ml-1">{syncStyle.label}</span>
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {account.lastSyncedAt && formatTimeAgo(account.lastSyncedAt)}
                    </span>
                  </div>
                  {account.syncStatus === 'failed' && account.syncErrorMessage && (
                    <p className="text-xs text-red-600 mt-2 flex items-start gap-1">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5" />
                      {account.syncErrorMessage}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-600 text-xs">포스트</p>
                    <p className="font-semibold text-gray-900">{account.postCount || 0}개</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-600 text-xs">일 수익</p>
                    <p className="font-semibold text-gray-900">
                      {formatRevenue(account.dailyRevenue || 0)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-600 text-xs">주 수익</p>
                    <p className="font-semibold text-gray-900">
                      {formatRevenue(account.weeklyRevenue || 0)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-600 text-xs">월 수익</p>
                    <p className="font-semibold text-indigo-600">
                      {formatRevenue(account.monthlyRevenue || 0)}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-3"></div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openDetailModal(account)}
                    className="flex-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all duration-200 text-sm font-medium"
                  >
                    상세보기
                  </button>
                  <button
                    onClick={() => handleSync(account.id)}
                    className="flex-1 px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all duration-200 text-sm font-medium"
                  >
                    <FontAwesomeIcon icon={faSync} className="mr-1" />
                    동기화
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Table View
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {(user?.role === 'admin' || user?.role === 'moderator') && (
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      소유자
                    </th>
                  )}
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    플랫폼
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    계정명
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    동기화 상태
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    포스트
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    월 수익
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    마지막 동기화
                  </th>
                  <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => {
                  const platformColor = platformColors[account.platform?.name] || platformColors.naver;
                  const syncStyle = syncStatusStyles[account.syncStatus] || syncStatusStyles.pending;

                  return (
                    <tr key={account.id} className="hover:bg-gray-50">
                      {(user?.role === 'admin' || user?.role === 'moderator') && (
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {account.user?.username || '-'}
                            </div>
                            {account.user && (
                              <div className="text-xs text-gray-500">{account.user.email}</div>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{platformColor.icon}</span>
                          <span className={`font-medium ${platformColor.text}`}>
                            {account.platform?.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {account.accountName || '이름 없음'}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <a
                          href={account.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-1"
                        >
                          {account.url}
                          <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                        </a>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${syncStyle.bg} ${syncStyle.text}`}
                        >
                          <FontAwesomeIcon
                            icon={syncStyle.icon}
                            className={account.syncStatus === 'syncing' ? 'fa-spin' : ''}
                          />
                          <span className="ml-1">{syncStyle.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                        {account.postCount || 0}개
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap font-semibold text-indigo-600">
                        {formatRevenue(account.monthlyRevenue || 0)}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        {account.lastSyncedAt && formatTimeAgo(account.lastSyncedAt)}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right relative">
                        <button
                          onClick={() =>
                            setShowActionMenu(showActionMenu === account.id ? null : account.id)
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>
                        {showActionMenu === account.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={() => openDetailModal(account)}
                              className="w-full px-4 py-2 text-left text-sm text-indigo-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faEye} />
                              상세보기
                            </button>
                            <button
                              onClick={() => handleSync(account.id)}
                              className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faSync} />
                              수동 동기화
                            </button>
                            <button
                              onClick={() => openEditModal(account)}
                              className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                              수정
                            </button>
                            <button
                              onClick={() => handleToggleActive(account.id, account.isActive)}
                              className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faPowerOff} />
                              {account.isActive ? '비활성화' : '활성화'}
                            </button>
                            <button
                              onClick={() => openDeleteModal(account)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2 border-t"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                              삭제
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <AddAccountModal
          platforms={platforms}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchAccounts();
          }}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                <FontAwesomeIcon icon={faEye} />
                계정 상세 정보
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-base mb-3 text-gray-800">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedAccount.user && (user?.role === 'admin' || user?.role === 'moderator') && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-600">계정 소유자</label>
                      <p className="text-gray-900 mt-1">
                        {selectedAccount.user.username} ({selectedAccount.user.email})
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded bg-indigo-100 text-indigo-700">
                          {selectedAccount.user.role}
                        </span>
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">플랫폼</label>
                    <p className="text-gray-900 mt-1">{selectedAccount.platform?.displayName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">계정명</label>
                    <p className="text-gray-900 mt-1">
                      {selectedAccount.accountName || '이름 없음'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">URL</label>
                    <a
                      href={selectedAccount.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 mt-1 block"
                    >
                      {selectedAccount.url}
                    </a>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">상태</label>
                    <p className="mt-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          selectedAccount.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {selectedAccount.isActive ? '활성' : '비활성'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">포스트 수</label>
                    <p className="text-gray-900 mt-1">{selectedAccount.postCount || 0}개</p>
                  </div>
                </div>
              </div>

              {/* Sync Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-base mb-3 text-gray-800">동기화 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">동기화 상태</label>
                    <p className="mt-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          syncStatusStyles[selectedAccount.syncStatus]?.bg
                        } ${syncStatusStyles[selectedAccount.syncStatus]?.text}`}
                      >
                        {syncStatusStyles[selectedAccount.syncStatus]?.label}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">마지막 동기화</label>
                    <p className="text-gray-900 mt-1">
                      {selectedAccount.lastSyncedAt
                        ? new Date(selectedAccount.lastSyncedAt).toLocaleString('ko-KR')
                        : '-'}
                    </p>
                  </div>
                  {selectedAccount.syncErrorMessage && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-600">에러 메시지</label>
                      <p className="text-red-600 mt-1 text-sm">
                        {selectedAccount.syncErrorMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-base mb-3 text-gray-800">수익 통계</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">일 수익</label>
                    <p className="text-gray-900 mt-1 font-semibold">
                      {formatRevenue(selectedAccount.dailyRevenue || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">주 수익</label>
                    <p className="text-gray-900 mt-1 font-semibold">
                      {formatRevenue(selectedAccount.weeklyRevenue || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">월 수익</label>
                    <p className="text-indigo-600 mt-1 font-semibold text-base">
                      {formatRevenue(selectedAccount.monthlyRevenue || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(selectedAccount);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                수정
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal Placeholder */}
      {showEditModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-indigo-600">계정 수정</h2>
            <p className="text-gray-600 mb-4">
              계정 수정 기능은 백엔드 API 연동 후 구현됩니다.
            </p>
            <button
              onClick={() => setShowEditModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              계정 삭제
            </h2>
            <p className="text-gray-700 mb-2">
              정말로 <strong>{selectedAccount.accountName}</strong> 계정을 삭제하시겠습니까?
            </p>
            <p className="text-sm text-gray-600 mb-6">
              이 작업은 되돌릴 수 없으며, 모든 관련 데이터가 삭제됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add Account Modal Component
const AddAccountModal = ({ platforms, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    platformId: '',
    accountName: '',
    username: '',
    password: '',
    url: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.platformId) {
      newErrors.platformId = '플랫폼을 선택해주세요';
    }
    if (!formData.accountName || formData.accountName.trim() === '') {
      newErrors.accountName = '계정명을 입력해주세요';
    }
    if (!formData.username || formData.username.trim() === '') {
      newErrors.username = '로그인 아이디를 입력해주세요';
    }
    if (!formData.password || formData.password.trim() === '') {
      newErrors.password = '비밀번호를 입력해주세요';
    }
    if (!formData.url || formData.url.trim() === '') {
      newErrors.url = 'URL을 입력해주세요';
    } else if (!/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url = '올바른 URL 형식이 아닙니다 (http:// 또는 https://로 시작)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await api.post('/accounts', formData);
      alert('계정이 성공적으로 추가되었습니다.');
      onSuccess();
    } catch (error) {
      console.error('Failed to add account:', error);
      alert(error.response?.data?.message || '계정 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const selectedPlatform = platforms.find(p => p.id === parseInt(formData.platformId));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} />
            계정 추가
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              플랫폼 <span className="text-red-500">*</span>
            </label>
            <select
              name="platformId"
              value={formData.platformId}
              onChange={handleChange}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                errors.platformId ? 'border-red-500' : 'border-gray-300'
              } ${loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              disabled={loading}
              required
            >
              <option value="">플랫폼을 선택하세요</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.displayName}
                </option>
              ))}
            </select>
            {errors.platformId && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />
                {errors.platformId}
              </p>
            )}
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              계정명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              placeholder="예: 내 블로그"
              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                errors.accountName ? 'border-red-500' : 'border-gray-300'
              } ${loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              disabled={loading}
              required
            />
            {errors.accountName && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />
                {errors.accountName}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              로그인 아이디 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={selectedPlatform ? `${selectedPlatform.displayName} 로그인 아이디` : '아이디를 입력하세요'}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              } ${loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              disabled={loading}
              required
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />
                {errors.username}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-2">
              {selectedPlatform?.name === 'naver' && '네이버 아이디를 입력하세요'}
              {selectedPlatform?.name === 'tistory' && '티스토리 이메일 또는 아이디를 입력하세요'}
              {selectedPlatform?.name === 'velog' && '벨로그 아이디를 입력하세요'}
              {selectedPlatform?.name === 'brunch' && '브런치 아이디를 입력하세요'}
              {!selectedPlatform && '플랫폼 로그인에 사용하는 아이디'}
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호"
              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } ${loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              disabled={loading}
              required
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />
                {errors.password}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-2">
              비밀번호는 암호화되어 안전하게 저장됩니다
            </p>
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              블로그 URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder={
                selectedPlatform?.name === 'naver' ? 'https://blog.naver.com/아이디' :
                selectedPlatform?.name === 'tistory' ? 'https://블로그명.tistory.com' :
                selectedPlatform?.name === 'velog' ? 'https://velog.io/@아이디' :
                selectedPlatform?.name === 'brunch' ? 'https://brunch.co.kr/@아이디' :
                'https://...'
              }
              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                errors.url ? 'border-red-500' : 'border-gray-300'
              } ${loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              disabled={loading}
              required
            />
            {errors.url && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />
                {errors.url}
              </p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              disabled={loading}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-800 cursor-pointer select-none flex-1">
              활성 상태로 추가
            </label>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800 leading-relaxed">
                계정 추가 후 자동으로 동기화가 시작됩니다. 로그인 정보가 올바른지 확인해주세요.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  추가 중...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} />
                  계정 추가
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountsPage;
