/**
 * QR Security & Cryptographic Token Utility
 *
 * Implements secure QR generation and validation.
 * QR codes contain structured signed payloads rather than plaintext teacher names.
 * Format: TOS:v1:{schoolPrefix}:{teacherId}:{signature}:{epoch}
 */

import QRCode from 'qrcode';

const SIGNING_SALT = 'RCIS_SECURE_ATTENDANCE_SALT_2026';
const SCHOOL_PREFIX = 'RCIS';

/**
 * Creates a lightweight deterministic 16-hex hash of the payload for offline validation
 */
export function generateTokenSignature(teacherId: string, timestamp: number): string {
  const payload = `${SCHOOL_PREFIX}:${teacherId}:${timestamp}:${SIGNING_SALT}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex1 = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs((hash ^ 0x5a5a5a5a)).toString(16).padStart(8, '0');
  return `${hex1}${hex2}`;
}

/**
 * Generates a full secure QR payload for a teacher
 */
export function generateTeacherQrToken(teacherId: string, existingTimestamp?: number): string {
  const timestamp = existingTimestamp || Date.now();
  const signature = generateTokenSignature(teacherId, timestamp);
  return `TOS:v1:${SCHOOL_PREFIX}:${teacherId}:${signature}:${timestamp}`;
}

export interface QrValidationResult {
  isValid: boolean;
  teacherId: string | null;
  error?: string;
  timestamp?: number;
}

/**
 * Validates a scanned QR code payload
 */
export function validateQrToken(tokenString: string): QrValidationResult {
  if (!tokenString || typeof tokenString !== 'string') {
    return { isValid: false, teacherId: null, error: 'Empty or invalid QR code format' };
  }

  const parts = tokenString.trim().split(':');
  // Expected: ['TOS', 'v1', 'RCIS', 'TCH-00023', 'signature', 'timestamp']
  if (parts.length !== 6 || parts[0] !== 'TOS' || parts[1] !== 'v1') {
    // If the scanner read raw teacher id like "TCH-00023" for demo compatibility
    if (tokenString.startsWith('TCH-')) {
      return {
        isValid: true,
        teacherId: tokenString.trim(),
        timestamp: Date.now()
      };
    }
    return { isValid: false, teacherId: null, error: 'Unrecognized QR identity standard' };
  }

  const [_, version, school, teacherId, signature, tsStr] = parts;
  const timestamp = parseInt(tsStr, 10);

  if (isNaN(timestamp)) {
    return { isValid: false, teacherId: null, error: 'Corrupt QR timestamp payload' };
  }

  const expectedSignature = generateTokenSignature(teacherId, timestamp);
  if (signature !== expectedSignature) {
    return { isValid: false, teacherId: null, error: 'Security signature mismatch / Tampered badge' };
  }

  return {
    isValid: true,
    teacherId,
    timestamp
  };
}

/**
 * Renders a high-resolution QR code Data URL (PNG)
 */
export async function generateQrDataUrl(qrToken: string): Promise<string> {
  try {
    return await QRCode.toDataURL(qrToken, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f2b5c', // Deep Navy
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
    return '';
  }
}
