import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import api from '../utils/api';
import {
  faDollarSign,
  faChartLine,
  faCalendar,
  faWallet,
  faArrowUp,
  faArrowDown,
  faPlus,
  faFileAlt,
  faClock,
  faCalendarWeek,
  faCalendarAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

const DashboardPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    platformId: '',
    accountName: '',
    fields: {},
  });

  // useEffect to fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch platforms
        const platformsResponse = await api.get('/platforms');
        setPlatforms(platformsResponse.data.data || []);

        // Fetch blog accounts
        const accountsResponse = await api.get('/blog-accounts');
        setAccounts(accountsResponse.data.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock data - 실제로는 API에서 가져옵니다
  const revenueData = {
    today: 15000,
    weekly: 105000,
    monthly: 450000,
    withdrawable: 360000, // 월 수익의 80%
    monthlyChange: 12.5, // 전월 대비 증감률 (%)
    lastUpdated: new Date(), // 마지막 업데이트 시간
  };

  // 마지막 업데이트 시간 포맷
  const formatLastUpdated = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'decimal',
    }).format(amount);
  };

  const generateMonthOptions = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
      });
    }
    return months;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const selectedPlatform = platforms.find(p => p.id === parseInt(formData.platformId));

      if (!selectedPlatform) {
        alert('플랫폼을 선택해주세요.');
        return;
      }

      // Create blog account
      const response = await api.post('/blog-accounts', {
        platformId: parseInt(formData.platformId),
        accountName: formData.accountName,
        fields: formData.fields,
      });

      if (response.data.success) {
        // Refresh accounts list
        const accountsResponse = await api.get('/blog-accounts');
        setAccounts(accountsResponse.data.data || []);

        // Close modal and reset form
        setIsModalOpen(false);
        setFormData({
          platformId: '',
          accountName: '',
          fields: {},
        });

        alert('블로그 계정이 추가되었습니다.');
      }
    } catch (error) {
      console.error('Failed to create blog account:', error);
      alert(error.response?.data?.message || '블로그 계정 추가에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-1 text-gray-600">블로그 수익 현황을 한눈에 확인하세요</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>계정 추가</span>
        </button>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Today Revenue */}
        <div className="card border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-900 text-xs font-bold">오늘 수익</span>
            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faDollarSign} className="text-green-600 text-sm" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.today)}원</p>
          <p className="text-gray-500 text-xs mt-1">{formatLastUpdated(revenueData.lastUpdated)}</p>
        </div>

        {/* Weekly Revenue */}
        <div className="card border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-900 text-xs font-bold">주간 수익</span>
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faChartLine} className="text-blue-600 text-sm" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.weekly)}원</p>
          <p className="text-gray-500 text-xs mt-1">최근 7일 합계</p>
        </div>

        {/* Monthly Revenue */}
        <div className="card border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-900 text-xs font-bold">월간 수익</span>
            <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCalendar} className="text-purple-600 text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.monthly)}원</p>
            <span
              className={`flex items-center gap-1 text-xs font-medium ${
                revenueData.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <FontAwesomeIcon
                icon={revenueData.monthlyChange >= 0 ? faArrowUp : faArrowDown}
              />
              {Math.abs(revenueData.monthlyChange)}%
            </span>
          </div>
          <select
            value={`${selectedYear}-${selectedMonth}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split('-');
              setSelectedYear(parseInt(year));
              setSelectedMonth(parseInt(month));
            }}
            className="text-xs bg-gray-50 text-gray-700 border border-gray-200 rounded px-2 py-1"
          >
            {generateMonthOptions().map((option) => (
              <option
                key={`${option.year}-${option.month}`}
                value={`${option.year}-${option.month}`}
                className="text-gray-900"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Withdrawable */}
        <div className="card border border-gray-200 p-4 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-900 text-xs font-bold">출금 가능</span>
            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faWallet} className="text-indigo-600 text-sm" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.withdrawable)}원</p>
          <p className="text-gray-500 text-xs mt-1">
            ({formatCurrency(Math.floor(revenueData.withdrawable * 0.967))}원)
          </p>
          <button className="absolute bottom-4 right-4 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors">
            출금 신청
          </button>
        </div>
      </div>

      {/* Accounts List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">블로그 계정</h2>
          <Link to="/accounts" className="text-primary-indigo hover:underline text-sm font-medium">
            전체 보기 →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            로딩 중...
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            등록된 블로그 계정이 없습니다. 계정을 추가해주세요.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <Link
                key={account.id}
                to={`/accounts/${account.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-indigo hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.accountName || '이름 없음'}</h3>
                      <p className="text-sm text-gray-500">{account.platform?.name || '플랫폼 정보 없음'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <FontAwesomeIcon icon={faFileAlt} className="text-gray-400" />
                    <span className="font-medium text-gray-900">0</span>
                    <span>포스트</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      account.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {account.isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      account.syncStatus === 'success' ? 'bg-green-100 text-green-700' :
                      account.syncStatus === 'failed' ? 'bg-red-100 text-red-700' :
                      account.syncStatus === 'syncing' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {account.syncStatus === 'success' ? '동기화 완료' :
                       account.syncStatus === 'failed' ? '동기화 실패' :
                       account.syncStatus === 'syncing' ? '동기화 중' :
                       '대기 중'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">블로그 계정 추가</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Platform */}
              <div>
                <label htmlFor="platformId" className="block text-sm font-medium text-gray-700 mb-2">
                  플랫폼
                </label>
                <select
                  id="platformId"
                  name="platformId"
                  value={formData.platformId}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">플랫폼 선택</option>
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Name */}
              <div>
                <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
                  계정 이름
                </label>
                <input
                  type="text"
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  placeholder="계정 이름을 입력하세요 (예: 내 블로그)"
                  className="input-field"
                  required
                />
              </div>

              {/* Dynamic Fields based on selected platform */}
              {formData.platformId && platforms.find(p => p.id === parseInt(formData.platformId))?.fields?.map((field) => (
                <div key={field.id}>
                  <label htmlFor={`field-${field.fieldName}`} className="block text-sm font-medium text-gray-700 mb-2">
                    {field.displayName}
                    {!field.isRequired && ' (선택)'}
                  </label>
                  <input
                    type={field.isEncrypted ? 'password' : 'text'}
                    id={`field-${field.fieldName}`}
                    name={field.fieldName}
                    value={formData.fields[field.fieldName] || ''}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        fields: {
                          ...prev.fields,
                          [field.fieldName]: e.target.value
                        }
                      }));
                    }}
                    placeholder={field.placeholder || `${field.displayName}을(를) 입력하세요`}
                    className="input-field"
                    required={field.isRequired}
                  />
                  {field.description && (
                    <p className="mt-1 text-xs text-gray-500">{field.description}</p>
                  )}
                </div>
              ))}

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({
                      platformId: '',
                      accountName: '',
                      fields: {},
                    });
                  }}
                  className="btn-secondary flex-1"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  추가하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
