'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    currentBalance: 0,
    chartData: []
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const dashRes = await fetch('/api/dashboard');
        const dashData = await dashRes.json();
        setData(dashData);

        const txRes = await fetch('/api/transactions?limit=5');
        const txData = await txRes.json();
        setTransactions(txData);
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '20vh' }}>Loading data...</div>;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '24px', fontWeight: 600 }}>Overview</h2>
      
      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Wallet size={24} className="text-accent" />
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>Total Balance</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {formatCurrency(data.currentBalance)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <ArrowUpRight size={24} className="text-success" />
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>Total Income</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
            {formatCurrency(data.totalIncome)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <ArrowDownRight size={24} className="text-danger" />
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>Total Expense</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>
            {formatCurrency(data.totalExpense)}
          </div>
        </div>
      </div>

      {/* Chart & Recent Transactions row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Cashflow 30 Days</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp ${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="income" stroke="var(--success)" fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="var(--danger)" fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Recent Transactions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No recent transactions.</p>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--glass-border)' }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{tx.description || tx.category?.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(tx.date).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontWeight: 600, color: tx.type === 'INCOME' ? 'var(--success)' : 'var(--danger)' }}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
          <a href="/transactions" style={{ display: 'inline-block', marginTop: '20px', color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: 500 }}>
            View All Transactions &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
