import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="card animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        로그인
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            아이디 또는 이메일
          </label>
          <div className="relative">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="아이디를 입력하세요"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호
          </label>
          <div className="relative">
            <FontAwesomeIcon
              icon={faLock}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 rounded border-gray-300 text-primary-indigo focus:ring-primary-indigo"
            />
            <span className="text-gray-600">자동 로그인</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-primary-indigo hover:underline"
          >
            비밀번호 찾기
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      {/* Signup Link */}
      <div className="mt-6 text-center text-sm text-gray-600">
        계정이 없으신가요?{' '}
        <Link to="/signup" className="text-primary-indigo font-medium hover:underline">
          회원가입
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
