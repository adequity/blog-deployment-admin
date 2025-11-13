-- =====================================================
-- Railway PostgreSQL - User 테이블 컬럼 추가 스크립트
-- =====================================================
-- 실행 위치: pgAdmin4 Query Tool
-- 대상 DB: Railway PostgreSQL (blog_deployment)
-- 작성일: 2025-11-13
-- 수정: 신분 정보를 이미지 업로드 방식으로 변경
-- =====================================================

-- 1. role ENUM 타입 생성 (이미 존재할 수 있음)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
        CREATE TYPE "enum_users_role" AS ENUM ('user', 'admin');
    END IF;
END $$;

-- 2. id_type ENUM 타입 생성
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_id_type') THEN
        CREATE TYPE "enum_users_id_type" AS ENUM ('resident_card', 'driver_license', 'passport');
    END IF;
END $$;

-- 3. role 컬럼 추가 (이미 추가되었을 수 있음)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users
        ADD COLUMN role "enum_users_role" NOT NULL DEFAULT 'user';

        COMMENT ON COLUMN users.role IS '사용자 권한 (user: 일반 사용자, admin: 관리자)';
    END IF;
END $$;

-- 4. 정산 정보 컬럼 추가
DO $$
BEGIN
    -- bank_name 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'bank_name'
    ) THEN
        ALTER TABLE users
        ADD COLUMN bank_name VARCHAR(100);

        COMMENT ON COLUMN users.bank_name IS '은행명';
    END IF;

    -- account_number 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'account_number'
    ) THEN
        ALTER TABLE users
        ADD COLUMN account_number VARCHAR(50);

        COMMENT ON COLUMN users.account_number IS '계좌번호';
    END IF;

    -- account_holder 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'account_holder'
    ) THEN
        ALTER TABLE users
        ADD COLUMN account_holder VARCHAR(100);

        COMMENT ON COLUMN users.account_holder IS '예금주명';
    END IF;
END $$;

-- 5. 신분 정보 컬럼 추가 (이미지 업로드 방식)
DO $$
BEGIN
    -- real_name 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'real_name'
    ) THEN
        ALTER TABLE users
        ADD COLUMN real_name VARCHAR(100);

        COMMENT ON COLUMN users.real_name IS '실명';
    END IF;

    -- id_type 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'id_type'
    ) THEN
        ALTER TABLE users
        ADD COLUMN id_type "enum_users_id_type";

        COMMENT ON COLUMN users.id_type IS '신분증 종류 (resident_card: 주민등록증, driver_license: 운전면허증, passport: 여권)';
    END IF;

    -- id_image_url 컬럼 (신분증 이미지 URL)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'id_image_url'
    ) THEN
        ALTER TABLE users
        ADD COLUMN id_image_url VARCHAR(500);

        COMMENT ON COLUMN users.id_image_url IS '신분증 이미지 URL (S3/Cloudinary)';
    END IF;

    -- id_image_key 컬럼 (이미지 삭제용 키)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'id_image_key'
    ) THEN
        ALTER TABLE users
        ADD COLUMN id_image_key VARCHAR(500);

        COMMENT ON COLUMN users.id_image_key IS '신분증 이미지 저장소 키 (삭제용)';
    END IF;

    -- id_verified 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'id_verified'
    ) THEN
        ALTER TABLE users
        ADD COLUMN id_verified BOOLEAN NOT NULL DEFAULT false;

        COMMENT ON COLUMN users.id_verified IS '신분증 인증 여부';
    END IF;

    -- id_verified_at 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'id_verified_at'
    ) THEN
        ALTER TABLE users
        ADD COLUMN id_verified_at TIMESTAMP WITH TIME ZONE;

        COMMENT ON COLUMN users.id_verified_at IS '신분증 인증 일시';
    END IF;
END $$;

-- 6. role 인덱스 추가 (이미 존재할 수 있음)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'users' AND indexname = 'users_role'
    ) THEN
        CREATE INDEX users_role ON users(role);
    END IF;
END $$;

-- 7. 생성된 컬럼 확인
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- =====================================================
-- 실행 완료 후 확인사항:
-- 1. 모든 컬럼이 정상적으로 추가되었는지 확인
-- 2. ENUM 타입이 생성되었는지 확인
-- 3. 인덱스가 생성되었는지 확인
--
-- 신분 정보 구조:
-- - real_name: 실명
-- - id_type: 신분증 종류 (주민등록증/운전면허증/여권)
-- - id_image_url: 신분증 이미지 접근 URL
-- - id_image_key: 이미지 삭제를 위한 저장소 키
-- - id_verified: 관리자 인증 여부
-- - id_verified_at: 인증 완료 시각
--
-- 다음 단계:
-- 1. AWS S3 또는 Cloudinary 계정 생성
-- 2. 파일 업로드 미들웨어 설치 (multer, multer-s3 등)
-- 3. 이미지 업로드 API 구현
-- =====================================================
