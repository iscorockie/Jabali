import { NextRequest, NextResponse } from 'next/server';
import { saveInquiry } from '@/lib/booking-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const inquiryReference = `JBL-INQ-${new Date().getFullYear()}-${randomCode}`;

    const record = {
      inquiryReference,
      createdAt: new Date().toISOString(),
      fullName: body.fullName || '',
      email: body.email || '',
      phone: body.phone || '',
      country: body.country || '',
      preferredMonth: body.preferredMonth || '',
      durationDays: body.durationDays || '8–10 Days',
      guests: body.guests || 2,
      budgetPerPerson: body.budgetPerPerson || '$5,500 – $8,500',
      interests: body.interests || [],
      notes: body.notes || '',
      assignedSpecialist: 'Grace Namatovu (Kampala & Fort Portal Desk)',
    };

    saveInquiry(record);

    return NextResponse.json({
      success: true,
      inquiryReference,
      record,
    });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return NextResponse.json({ error: 'Unable to submit inquiry' }, { status: 500 });
  }
}
