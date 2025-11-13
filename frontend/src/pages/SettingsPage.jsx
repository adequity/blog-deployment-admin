import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faWallet,
  faIdCard,
  faCamera,
  faSave,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 프로필 정보
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
  });

  // 정산 정보
  const [settlementData, setSettlementData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });

  // 신분증 정보
  const [idData, setIdData] = useState({
    realName: '',
    idType: 'resident_card',
    idImage: null,
    idImagePreview: null,
  });

  const tabs = [
    { id: 'profile', label: '프로필', icon: faUser },
    { id: 'settlement', label: '정산 정보', icon: faWallet },
    { id: 'identity', label: '신분 인증', icon: faIdCard },
  ];

  const idTypes = [
    { value: 'resident_card', label: '주민등록증' },
    { value: 'driver_license', label: '운전면허증' },
    { value: 'passport', label: '여권' },
  ];

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSettlementChange = (e) => {
    setSettlementData({
      ...settlementData,
      [e.target.name]: e.target.value,
    });
  };

  const handleIdDataChange = (e) => {
    setIdData({
      ...idData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: '이미지 크기는 5MB 이하여야 합니다.' });
        return;
      }

      // 이미지 미리보기
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdData({
          ...idData,
          idImage: reader.result, // Base64
          idImagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // TODO: API 연결
    setTimeout(() => {
      setMessage({ type: 'success', text: '프로필이 업데이트되었습니다.' });
      setLoading(false);
    }, 1000);
  };

  const handleSettlementSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // TODO: API 연결
    setTimeout(() => {
      setMessage({ type: 'success', text: '정산 정보가 업데이트되었습니다.' });
      setLoading(false);
    }, 1000);
  };

  const handleIdSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!idData.realName || !idData.idImage) {
      setMessage({ type: 'error', text: '실명과 신분증 이미지를 모두 입력해주세요.' });
      setLoading(false);
      return;
    }

    // TODO: API 연결
    setTimeout(() => {
      setMessage({ type: 'success', text: '신분증이 업로드되었습니다. 관리자 승인 대기 중입니다.' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">설정</h1>

      {/* 메시지 알림 */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
        >
          <FontAwesomeIcon
            icon={message.type === 'success' ? faCheckCircle : faTimesCircle}
            className="text-xl"
          />
          <span>{message.text}</span>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="card mb-6">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage({ type: '', text: '' });
              }}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 프로필 탭 */}
      {activeTab === 'profile' && (
        <div className="card animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">프로필 정보</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용자명
              </label>
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                className="input-field"
                placeholder="사용자명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className="input-field"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="input-field"
                placeholder="전화번호를 입력하세요"
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              <FontAwesomeIcon
                icon={loading ? faSpinner : faSave}
                className={loading ? 'animate-spin mr-2' : 'mr-2'}
              />
              {loading ? '저장 중...' : '저장'}
            </button>
          </form>
        </div>
      )}

      {/* 정산 정보 탭 */}
      {activeTab === 'settlement' && (
        <div className="card animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">정산 정보</h2>
          <p className="text-sm text-gray-600 mb-6">
            수익 정산을 위한 계좌 정보를 입력해주세요.
          </p>

          <form onSubmit={handleSettlementSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                은행명
              </label>
              <input
                type="text"
                name="bankName"
                value={settlementData.bankName}
                onChange={handleSettlementChange}
                className="input-field"
                placeholder="예: 국민은행"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                계좌번호
              </label>
              <input
                type="text"
                name="accountNumber"
                value={settlementData.accountNumber}
                onChange={handleSettlementChange}
                className="input-field"
                placeholder="계좌번호를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                예금주명
              </label>
              <input
                type="text"
                name="accountHolder"
                value={settlementData.accountHolder}
                onChange={handleSettlementChange}
                className="input-field"
                placeholder="예금주명을 입력하세요"
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              <FontAwesomeIcon
                icon={loading ? faSpinner : faSave}
                className={loading ? 'animate-spin mr-2' : 'mr-2'}
              />
              {loading ? '저장 중...' : '저장'}
            </button>
          </form>
        </div>
      )}

      {/* 신분 인증 탭 */}
      {activeTab === 'identity' && (
        <div className="card animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">신분 인증</h2>
          <p className="text-sm text-gray-600 mb-6">
            본인 확인을 위해 실명과 신분증 사진을 업로드해주세요. 관리자 승인 후 인증이 완료됩니다.
          </p>

          <form onSubmit={handleIdSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                실명
              </label>
              <input
                type="text"
                name="realName"
                value={idData.realName}
                onChange={handleIdDataChange}
                className="input-field"
                placeholder="실명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                신분증 종류
              </label>
              <select
                name="idType"
                value={idData.idType}
                onChange={handleIdDataChange}
                className="input-field"
              >
                {idTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                신분증 사진
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                {idData.idImagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={idData.idImagePreview}
                      alt="신분증 미리보기"
                      className="max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setIdData({ ...idData, idImage: null, idImagePreview: null })
                      }
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      이미지 제거
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <FontAwesomeIcon
                      icon={faCamera}
                      className="text-5xl text-gray-400 mb-4"
                    />
                    <p className="text-gray-600 mb-2">
                      클릭하여 신분증 사진을 업로드하세요
                    </p>
                    <p className="text-sm text-gray-500">
                      JPG, PNG, WEBP 형식 (최대 5MB)
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              <FontAwesomeIcon
                icon={loading ? faSpinner : faIdCard}
                className={loading ? 'animate-spin mr-2' : 'mr-2'}
              />
              {loading ? '업로드 중...' : '신분증 업로드'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
