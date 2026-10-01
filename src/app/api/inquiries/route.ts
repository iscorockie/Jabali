import { NextRequest, NextResponse } from 'next/server';
import { listInquiries, saveInquiry, updateInquiryStatus } from '@/lib/booking-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    inquiries: listInquiries(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const inquiryReference = `JBL-INQ-${new Date().getFullYear()}-${randomCode}`;

    const record = saveInquiry({
      inquiryReference,
      createdAt: new Date().toISOString(),
      status: 'new',
      fullName: body.fullName || '',
      email: body.email || '',
      phone: body.phone || '',
      country: body.country || '',
      preferredMonth: body.preferredMonth || '',
      durationDays: body.durationDays || '8–10 Days',
      guests: Number(body.guests) || 2,
      budgetPerPerson: body.budgetPerPerson || '$5,500 – $8,500',
      interests: Array.isArray(body.interests) ? body.interests : [],
      notes: body.notes || '',
      assignedSpecialist: 'Grace Namatovu (Kampala & Fort Portal Desk)',
    });

    return NextResponse.json({
      success: true,
      inquiryReference: record.inquiryReference,
      record,
    });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return NextResponse.json({ error: 'Unable to submit inquiry' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { inquiryReference, status } = body;
    if (!inquiryReference || !status) {
      return NextResponse.json({ error: 'Missing inquiryReference or status' }, { status: 400 });
    }
    const updated = updateInquiryStatus(inquiryReference, status);
    if (!updated) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    return NextResponse.json({ inquiry: updated });
  } catch {
    return NextResponse.json({ error: 'Unable to update inquiry status' }, { status: 500 });
  }
}
