import { NextRequest, NextResponse } from 'next/server';
import { EXPEDITIONS, getExpeditionById } from '@/data/expeditions';
import { getMonthAvailability } from '@/lib/booking-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const expeditionId = searchParams.get('expeditionId') || EXPEDITIONS[0].id;
  const now = new Date();
  const year = parseInt(searchParams.get('year') || String(now.getUTCFullYear()), 10);
  const month = parseInt(searchParams.get('month') || String(now.getUTCMonth() + 1), 10);

  const expedition = getExpeditionById(expeditionId) || EXPEDITIONS[0];
  const days = getMonthAvailability(expedition.id, year, month);

  return NextResponse.json({
    expeditionId: expedition.id,
    expeditionTitle: expedition.title,
    trekkingSector: expedition.trekkingSector || 'Buhoma Sector',
    dailyPermitQuota: expedition.dailyPermitQuota,
    year,
    month,
    days,
    syncedAt: new Date().toISOString(),
    authorityNote:
      'Mountain gorilla ($800) and chimpanzee ($250) permits are regulated by the Uganda Wildlife Authority (UWA) with a strict cap of 8 trekkers per habituated gorilla family per day.',
  });
}
