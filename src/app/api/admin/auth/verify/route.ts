import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    const admin = await db.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true, 
        email: true
      }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: admin });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}