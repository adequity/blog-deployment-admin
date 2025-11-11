import { useParams } from 'react-router-dom';

const AccountDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">계정 상세 #{id}</h1>
      <div className="card">
        <p className="text-gray-600">계정 상세 페이지 - 개발 예정</p>
      </div>
    </div>
  );
};

export default AccountDetailPage;
