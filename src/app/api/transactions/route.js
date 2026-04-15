import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      include: { category: true },
      take: limit ? parseInt(limit) : undefined
    });
    
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(data.amount),
        type: data.type, // 'INCOME' or 'EXPENSE'
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description,
        categoryId: data.categoryId
      },
      include: { category: true }
    });
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
