import { logger } from './logger';

// Verifikasi reCAPTCHA token di server
export async function verifyRecaptcha(token: string): Promise<{ success: boolean; score?: number; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    logger.error('RECAPTCHA_SECRET_KEY not configured');
    return { success: false, error: 'reCAPTCHA not configured' };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      logger.warn('reCAPTCHA verification failed', data);
      return { success: false, error: 'Verifikasi CAPTCHA gagal' };
    }

    // reCAPTCHA v3 returns a score (0.0 - 1.0)
    // 0.0 = very likely a bot
    // 1.0 = very likely a human
    const score = data.score || 0;

    // Threshold: minimal 0.5 untuk dianggap human
    if (score < 0.5) {
      logger.warn('Low reCAPTCHA score', { score });
      return { success: false, score, error: 'Aktivitas mencurigakan terdeteksi' };
    }

    return { success: true, score };
  } catch (error) {
    logger.error('reCAPTCHA verification error:', error);
    return { success: false, error: 'Error verifikasi CAPTCHA' };
  }
}

// Load reCAPTCHA script di client
export function loadRecaptchaScript(siteKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Cek apakah script sudah ada
    if (typeof window !== 'undefined' && (window as any).grecaptcha) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA script'));
    };

    document.head.appendChild(script);
  });
}

// Execute reCAPTCHA dan dapatkan token
export function executeRecaptcha(siteKey: string, action: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !(window as any).grecaptcha) {
      reject(new Error('reCAPTCHA not loaded'));
      return;
    }

    (window as any).grecaptcha.ready(() => {
      (window as any).grecaptcha
        .execute(siteKey, { action })
        .then((token: string) => {
          resolve(token);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  });
}
