import { NextRequest, NextResponse } from 'next/server';
import { addNewsletterSubscriber } from '@/lib/booking-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim();
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const sub = addNewsletterSubscriber(
      email,
      body.interest || 'Bwindi & East Africa Seasonal Permit Dispatches'
    );

    return NextResponse.json({
      success: true,
      subscriber: sub,
      message: 'Subscribed to Jabali Field Dispatches & UWA Permit Alerts.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to subscribe right now.' },
      { status: 500 }
    );
  }
}
