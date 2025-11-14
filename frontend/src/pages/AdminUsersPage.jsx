import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserCheck,
  faUserClock,
  faUserSlash,
  faSearch,
  faFilter,
  faEllipsisV,
  faCheck,
  faTimes,
  faTicket,
  faPlus,
  faEdit,
  faTrash,
  faEnvelope,
  faLock,
  faPhone,
  faShieldAlt,
  faDownload,
  faEye,
  faCheckSquare,
  faSquare,
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const AdminUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    referral_code: '',
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId, isActive) => {
    try {
      await api.patch(`/admin/users/${userId}`, { is_active: isActive });
      await fetchUsers();
      setShowActionMenu(null);
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert(error.response?.data?.message || '사용자 상태 업데이트에 실패했습니다.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', formData);
      alert('사용자가 생성되었습니다.');
      setShowCreateModal(false);
      setFormData({
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'user',
        referral_code: '',
      });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert(error.response?.data?.message || '사용자 생성에 실패했습니다.');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      await api.put(`/admin/users/${selectedUser.id}`, updateData);
      alert('사용자 정보가 업데이트되었습니다.');
      setShowEditModal(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert(error.response?.data?.message || '사용자 정보 업데이트에 실패했습니다.');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/admin/users/${selectedUser.id}`);
      alert('사용자가 삭제되었습니다.');
      setShowDeleteModal(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.message || '사용자 삭제에 실패했습니다.');
    }
  };

  const openEditModal = (u) => {
    setSelectedUser(u);
    setFormData({
      username: u.username,
      email: u.email,
      phone: u.phone || '',
      password: '',
      role: u.role,
      referral_code: u.referral_code || '',
    });
    setShowEditModal(true);
    setShowActionMenu(null);
  };

  const openDeleteModal = (u) => {
    setSelectedUser(u);
    setShowDeleteModal(true);
    setShowActionMenu(null);
  };

  const openDetailModal = (u) => {
    setSelectedUser(u);
    setShowDetailModal(true);
    setShowActionMenu(null);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const handleBulkStatusUpdate = async (isActive) => {
    if (selectedUsers.length === 0) {
      alert('선택된 사용자가 없습니다.');
      return;
    }

    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          api.patch(`/admin/users/${userId}`, { is_active: isActive })
        )
      );
      alert(`${selectedUsers.length}명의 사용자 상태가 업데이트되었습니다.`);
      setSelectedUsers([]);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to bulk update users:', error);
      alert(error.response?.data?.message || '일괄 업데이트에 실패했습니다.');
    }
  };

  const handleExportToCSV = () => {
    const csv = [
      ['사용자명', '이메일', '전화번호', '역할', '상태', '추천코드', '가입일'].join(','),
      ...filteredUsers.map((u) =>
        [
          u.username,
          u.email,
          u.phone || '',
          u.role === 'admin' ? '관리자' : '사용자',
          u.is_active ? '활성' : '비활성',
          u.referral_code || '',
          new Date(u.created_at).toLocaleDateString('ko-KR'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && u.is_active) ||
      (filterStatus === 'inactive' && !u.is_active);

    const matchesRole =
      filterRole === 'all' ||
      (filterRole === 'admin' && u.role === 'admin') ||
      (filterRole === 'moderator' && u.role === 'moderator') ||
      (filterRole === 'user' && u.role === 'user');

    return matchesSearch && matchesStatus && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
          <p className="mt-1 text-gray-600">등록된 사용자를 관리하고 승인하세요</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportToCSV}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faDownload} />
            CSV 내보내기
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            회원 추가
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">전체 사용자</span>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="card border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">활성 사용자</span>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUserCheck} className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
        </div>

        <div className="card border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">비활성 사용자</span>
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUserSlash} className="text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
        </div>

        <div className="card border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">관리자</span>
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldAlt} className="text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.admins}</p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="card bg-indigo-50 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-indigo-700 font-medium">
                {selectedUsers.length}명 선택됨
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusUpdate(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faCheck} />
                일괄 활성화
              </button>
              <button
                onClick={() => handleBulkStatusUpdate(false)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTimes} />
                일괄 비활성화
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                선택 해제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="이름, 이메일, 전화번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <FontAwesomeIcon
              icon={faFilter}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>

          <div className="relative">
            <FontAwesomeIcon
              icon={faShieldAlt}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">전체 역할</option>
              <option value="user">사용자</option>
              <option value="moderator">관리자</option>
              <option value="admin">최고 관리자</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? '검색 결과가 없습니다.'
              : '등록된 사용자가 없습니다.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left w-12">
                    <button
                      onClick={toggleSelectAll}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FontAwesomeIcon
                        icon={
                          selectedUsers.length === filteredUsers.length && filteredUsers.length > 0
                            ? faCheckSquare
                            : faSquare
                        }
                      />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    추천 코드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap w-12">
                      <button
                        onClick={() => toggleUserSelection(u.id)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <FontAwesomeIcon
                          icon={selectedUsers.includes(u.id) ? faCheckSquare : faSquare}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {u.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.username}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{u.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FontAwesomeIcon icon={faTicket} className="text-gray-400" />
                        {u.referral_code || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'moderator'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {u.role === 'admin' ? '최고 관리자' : u.role === 'moderator' ? '관리자' : '사용자'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          u.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {u.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button
                        onClick={() =>
                          setShowActionMenu(showActionMenu === u.id ? null : u.id)
                        }
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>

                      {showActionMenu === u.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <button
                            onClick={() => openDetailModal(u)}
                            className="w-full px-4 py-2 text-left text-sm text-indigo-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FontAwesomeIcon icon={faEye} />
                            상세보기
                          </button>
                          <button
                            onClick={() => openEditModal(u)}
                            className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            수정
                          </button>
                          {u.is_active ? (
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, false)}
                              className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                              비활성화
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, true)}
                              className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faCheck} />
                              활성화
                            </button>
                          )}
                          <button
                            onClick={() => openDeleteModal(u)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            삭제
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">회원 추가</h2>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사용자 이름 * <span className="text-xs text-gray-500">(3-50자, 중복 불가)</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faUserCheck}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                    />
                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={50}
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="예: user123"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 * <span className="text-xs text-gray-500">(유효한 이메일, 중복 불가)</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                    />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="예: user@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호 <span className="text-xs text-gray-500">(선택사항, 숫자와 -+() 만 가능)</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                    />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      pattern="[0-9\-+()]*"
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="예: 010-1234-5678"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 *
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                    />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="비밀번호를 입력하세요"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    역할
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faShieldAlt}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                    />
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                    >
                      <option value="user">사용자</option>
                      <option value="moderator">관리자</option>
                      <option value="admin">최고 관리자</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추천 코드 <span className="text-xs text-gray-500">(선택사항, 중복 불가)</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faTicket}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                    />
                    <input
                      type="text"
                      value={formData.referral_code}
                      onChange={(e) =>
                        setFormData({ ...formData, referral_code: e.target.value })
                      }
                      maxLength={20}
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="예: REF2024"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium"
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">회원 정보 수정</h2>
            <form onSubmit={handleEditUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사용자 이름
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    새 비밀번호 (변경하지 않으려면 비워두세요)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    역할
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="user">사용자</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    추천 코드
                  </label>
                  <input
                    type="text"
                    value={formData.referral_code}
                    onChange={(e) =>
                      setFormData({ ...formData, referral_code: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-red-600">회원 삭제</h2>
            <p className="text-gray-700 mb-6">
              정말로 <strong>{selectedUser.username}</strong> 사용자를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail User Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-indigo-600 flex items-center gap-2">
              <FontAwesomeIcon icon={faEye} />
              사용자 상세 정보
            </h2>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-800">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">사용자 ID</label>
                    <p className="text-gray-900 mt-1">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">사용자명</label>
                    <p className="text-gray-900 mt-1">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">이메일</label>
                    <p className="text-gray-900 mt-1">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">전화번호</label>
                    <p className="text-gray-900 mt-1">{selectedUser.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">역할</label>
                    <p className="mt-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          selectedUser.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {selectedUser.role === 'admin' ? '관리자' : '사용자'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">상태</label>
                    <p className="mt-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          selectedUser.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {selectedUser.is_active ? '활성' : '비활성'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-800">추가 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">추천 코드</label>
                    <p className="text-gray-900 mt-1">{selectedUser.referral_code || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">가입일</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedUser.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">최근 수정일</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedUser.updated_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">마지막 로그인</label>
                    <p className="text-gray-900 mt-1">
                      {selectedUser.last_login
                        ? new Date(selectedUser.last_login).toLocaleString('ko-KR')
                        : '로그인 기록 없음'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
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
    </div>
  );
};

export default AdminUsersPage;
