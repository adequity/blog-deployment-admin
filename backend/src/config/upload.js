import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Railway Volume 경로 (환경변수로 설정 가능)
const UPLOAD_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'uploads', 'id_images')
  : path.join(__dirname, '../../uploads/id_images');

// 업로드 디렉토리 생성
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Base64 이미지 저장
 * @param {string} base64String - Base64 인코딩된 이미지 문자열
 * @param {string} userId - 사용자 ID
 * @returns {Object} { filename, filePath, url }
 */
export const saveBase64Image = (base64String, userId) => {
  try {
    // Base64 데이터 파싱 (data:image/png;base64,... 형태)
    const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);

    if (!matches) {
      throw new Error('Invalid base64 image format');
    }

    const ext = matches[1]; // png, jpg, jpeg, webp
    const data = matches[2];

    // 허용된 이미지 포맷 확인
    const allowedFormats = ['png', 'jpg', 'jpeg', 'webp'];
    if (!allowedFormats.includes(ext.toLowerCase())) {
      throw new Error('Only PNG, JPG, JPEG, WEBP formats are allowed');
    }

    // 고유한 파일명 생성
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(8).toString('hex');
    const filename = `${userId}_${timestamp}_${randomStr}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Base64를 파일로 저장
    const buffer = Buffer.from(data, 'base64');

    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      throw new Error('File size exceeds 5MB limit');
    }

    fs.writeFileSync(filePath, buffer);

    return {
      filename,
      filePath,
      url: `/api/v1/uploads/id_images/${filename}`,
    };
  } catch (error) {
    throw new Error(`Failed to save base64 image: ${error.message}`);
  }
};

/**
 * 파일 삭제
 * @param {string} filename - 삭제할 파일명
 * @returns {boolean} 삭제 성공 여부
 */
export const deleteIdImage = (filename) => {
  try {
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
};

/**
 * 파일을 Base64로 읽기
 * @param {string} filename - 파일명
 * @returns {string} Base64 인코딩된 이미지
 */
export const readImageAsBase64 = (filename) => {
  try {
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).slice(1); // .jpg -> jpg
    const mimeType = `image/${ext}`;
    const base64 = buffer.toString('base64');

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    throw new Error(`Failed to read image: ${error.message}`);
  }
};

/**
 * 업로드 디렉토리 경로 반환
 */
export const getUploadDir = () => UPLOAD_DIR;

/**
 * 파일 URL 생성
 */
export const getFileUrl = (filename) => {
  return `/api/v1/uploads/id_images/${filename}`;
};

/**
 * 파일 존재 여부 확인
 */
export const fileExists = (filename) => {
  const filePath = path.join(UPLOAD_DIR, filename);
  return fs.existsSync(filePath);
};
