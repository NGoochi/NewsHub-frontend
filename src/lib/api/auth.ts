import { TokenVerifyResponse } from '@/types';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

/**
 * Login with password
 * Note: This calls the Next.js API route which will set the cookie
 */
export async function login(password: string): Promise<void> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Login failed');
  }
}

/**
 * Logout - clears the auth cookie
 */
export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
}

/**
 * Verify token validity
 * Reads token from cookie and sends in Authorization header
 */
export async function verifyToken(): Promise<TokenVerifyResponse> {
  const token = Cookies.get('authToken');
  
  if (!token) {
    return { valid: false };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { valid: false };
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    return { valid: false };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false };
  }
}

