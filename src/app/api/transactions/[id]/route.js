import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.transaction.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: data.amount ? parseFloat(data.amount) : undefined,
        type: data.type,
        date: data.date ? new Date(data.date) : undefined,
        description: data.description,
        categoryId: data.categoryId
      },
      include: { category: true }
    });
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}
