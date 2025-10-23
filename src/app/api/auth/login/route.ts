import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // Call backend login endpoint
    console.log(`[Login] Calling backend at: ${BACKEND_URL}/auth/login`);
    
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    console.log(`[Login] Backend response status: ${response.status}`);
    
    const data = await response.json();
    console.log('[Login] Backend response data:', data);

    if (!response.ok || !data.success) {
      console.error('[Login] Backend error:', data.error || 'Login failed');
      return NextResponse.json(
        { success: false, error: data.error || 'Login failed' },
        { status: response.status }
      );
    }
    
    console.log('[Login] Login successful, setting cookie');

    // Set cookie with the token (not httpOnly so we can read it to attach to Authorization header)
    // Note: While httpOnly would be more secure, the backend expects Bearer token in Authorization header
    // The token is still protected by sameSite and secure flags
    const cookieStore = await cookies();
    cookieStore.set('authToken', data.data.token, {
      httpOnly: false, // Must be false so client can read and attach to Authorization header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      data: {
        expiresIn: data.data.expiresIn,
        expiresAt: data.data.expiresAt,
      },
    });
  } catch (error) {
    console.error('Login API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

