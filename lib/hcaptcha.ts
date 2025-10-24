import { logger } from './logger';

// Verifikasi hCaptcha token di server
export async function verifyHcaptcha(token: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.HCAPTCHA_SECRET_KEY;

  if (!secretKey) {
    logger.error('HCAPTCHA_SECRET_KEY not configured');
    return { success: false, error: 'hCaptcha not configured' };
  }

  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      logger.warn('hCaptcha verification failed', data);
      return { success: false, error: 'Verifikasi CAPTCHA gagal' };
    }

    logger.info('hCaptcha verified successfully');
    return { success: true };
  } catch (error) {
    logger.error('hCaptcha verification error:', error);
    return { success: false, error: 'Error verifikasi CAPTCHA' };
  }
}
