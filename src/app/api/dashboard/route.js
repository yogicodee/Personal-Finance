import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

export async function GET() {
  try {
    // Get total current metrics
    const typeAggregations = await prisma.transaction.groupBy({
      by: ['type'],
      _sum: {
        amount: true
      }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    typeAggregations.forEach(agg => {
      if (agg.type === 'INCOME') totalIncome = agg._sum.amount || 0;
      if (agg.type === 'EXPENSE') totalExpense = agg._sum.amount || 0;
    });

    const currentBalance = totalIncome - totalExpense;

    // Last 30 days transactions for chart
    const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));
    
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { date: 'asc' }
    });

    // Group by date
    const chartDataMap = {};
    for (let i = 29; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'MMM dd');
        chartDataMap[d] = { name: d, income: 0, expense: 0 };
    }

    recentTransactions.forEach(t => {
      const d = format(t.date, 'MMM dd');
      if(chartDataMap[d]) {
        if (t.type === 'INCOME') chartDataMap[d].income += t.amount;
        if (t.type === 'EXPENSE') chartDataMap[d].expense += t.amount;
      }
    });

    const chartData = Object.values(chartDataMap);

    return NextResponse.json({
      totalIncome,
      totalExpense,
      currentBalance,
      chartData
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch dashboard summary' }, { status: 500 });
  }
}
