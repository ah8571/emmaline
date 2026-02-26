import { NextRequest, NextResponse } from 'next/server';

/**
 * Newsletter subscription endpoint
 * Stores emails in backend database for the waitlist
 */
export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Forward to backend API to store the email
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    
    try {
      const response = await fetch(`${backendUrl}/api/newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      return NextResponse.json(
        { message: 'Successfully subscribed to newsletter' },
        { status: 201 }
      );
    } catch (backendError) {
      console.error('Backend communication error:', backendError);
      
      // If backend is down, still accept the email (for graceful degradation)
      return NextResponse.json(
        { message: 'Thanks for subscribing! We\'ll be in touch.' },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
