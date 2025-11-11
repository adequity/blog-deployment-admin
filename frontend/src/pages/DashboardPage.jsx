import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
} from '@fortawesome/free-solid-svg-icons';

const DashboardPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Mock data - 실제로는 API에서 가져옵니다
  const revenueData = {
    today: 15000,
    weekly: 105000,
    monthly: 450000,
    withdrawable: 360000, // 월 수익의 80%
    monthlyChange: 12.5, // 전월 대비 증감률 (%)
  };

  const accounts = [
    {
      id: 1,
      name: '맛집 블로그',
      platform: '네이버',
      icon: '📝',
      postCount: 234,
      dailyRevenue: 15000,
      weeklyRevenue: 105000,
      monthlyRevenue: 450000,
    },
    {
      id: 2,
      name: '여행 블로그',
      platform: '티스토리',
      icon: '💭',
      postCount: 189,
      dailyRevenue: 12000,
      weeklyRevenue: 84000,
      monthlyRevenue: 360000,
    },
    {
      id: 3,
      name: '개발 블로그',
      platform: '벨로그',
      icon: '🔧',
      postCount: 156,
      dailyRevenue: 8000,
      weeklyRevenue: 56000,
      monthlyRevenue: 240000,
    },
  ];

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-1 text-gray-600">블로그 수익 현황을 한눈에 확인하세요</p>
        </div>
        <Link
          to="/accounts/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>계정 추가</span>
        </Link>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Today Revenue */}
        <div className="card border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-xs font-medium">오늘 수익</span>
            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faDollarSign} className="text-green-600 text-sm" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.today)}원</p>
          <p className="text-gray-500 text-xs mt-1">실시간 업데이트</p>
        </div>

        {/* Weekly Revenue */}
        <div className="card border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-xs font-medium">주간 수익</span>
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
            <span className="text-gray-600 text-xs font-medium">월간 수익</span>
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
            <span className="text-gray-600 text-xs font-medium">출금 가능</span>
            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faWallet} className="text-indigo-600 text-sm" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-6">{formatCurrency(revenueData.withdrawable)}원</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <Link
              key={account.id}
              to={`/accounts/${account.id}`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary-indigo hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{account.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-500">{account.platform}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <FontAwesomeIcon icon={faFileAlt} className="text-gray-400" />
                  <span className="font-medium text-gray-900">{account.postCount}</span>
                  <span>포스트</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <FontAwesomeIcon icon={faClock} className="text-green-500" />
                  <span className="font-medium text-gray-900">{formatCurrency(account.dailyRevenue)}원</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <FontAwesomeIcon icon={faCalendarWeek} className="text-blue-500" />
                  <span className="font-medium text-gray-900">{formatCurrency(account.weeklyRevenue)}원</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-500" />
                  <span className="font-medium text-gray-900">{formatCurrency(account.monthlyRevenue)}원</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
