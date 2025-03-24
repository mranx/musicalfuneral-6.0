// src/app/api/forms/current/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const orderId = cookies().get('currentOrderId')?.value;
  
  if (!orderId) {
    return NextResponse.json(
      { success: false, message: 'No current order found' },
      { status: 404 }
    );
  }
  
  // Redirect to the orderId-specific endpoint
  const url = new URL(`/api/forms/${orderId}${req.nextUrl.search}`, req.url);
  return NextResponse.redirect(url);
}