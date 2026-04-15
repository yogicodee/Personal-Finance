'use client';

import { useEffect, useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [newCatName, setNewCatName] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories')
      ]);
      const txData = await txRes.json();
      const catData = await catRes.json();
      setTransactions(txData);
      setCategories(catData);
      if (catData.length > 0) setCategoryId(catData[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const handleCreateCategory = async () => {
    if(!newCatName) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName, type, color: '#66fcf1' })
    });
    const c = await res.json();
    setCategories([...categories, c]);
    setCategoryId(c.id);
    setNewCatName('');
    setShowNewCat(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!categoryId) return alert("Please select or create a category");
    
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, type, date, description, categoryId })
    });
    
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if(!confirm('Are you sure you want to delete this transaction?')) return;
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '20vh' }}>Loading data...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontWeight: 600 }}>Transactions</h2>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Transaction
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {transactions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No transactions found. Add some to see them here.</p>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '4px', fontSize: '1.05rem' }}>{tx.description || tx.category?.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '10px' }}>
                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                    <span>&bull;</span>
                    <span style={{ color: tx.category?.color || 'var(--text-secondary)' }}>{tx.category?.name}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontWeight: 600, color: tx.type === 'INCOME' ? 'var(--success)' : 'var(--danger)', fontSize: '1.1rem' }}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  <button onClick={() => handleDelete(tx.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.7 }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '30px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'white' }}>
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>Add Transaction</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className={`btn-secondary ${type === 'EXPENSE' ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '10px' }} onClick={() => setType('EXPENSE')}>Expense</button>
                <button type="button" className={`btn-secondary ${type === 'INCOME' ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '10px' }} onClick={() => setType('INCOME')}>Income</button>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Amount</label>
                <input type="number" required className="input-field" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Category</label>
                {!showNewCat ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select required className="input-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ flex: 1, backgroundColor: 'var(--bg-color-secondary)' }}>
                      {categories.filter(c => c.type === type).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      {categories.filter(c => c.type === type).length === 0 && <option value="" disabled>No categories available</option>}
                    </select>
                    <button type="button" className="btn-secondary" onClick={() => setShowNewCat(true)}>+</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" className="input-field" placeholder="New Category Name" value={newCatName} onChange={(e)=>setNewCatName(e.target.value)} />
                    <button type="button" className="btn-primary" onClick={handleCreateCategory}>Add</button>
                    <button type="button" className="btn-secondary" onClick={() => setShowNewCat(false)}>Cancel</button>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Date</label>
                <input type="date" required className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Description</label>
                <input type="text" className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Grocery, Salary" />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '14px' }}>Save Transaction</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
