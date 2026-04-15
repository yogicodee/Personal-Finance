import './globals.css';

export const metadata = {
  title: 'FinanceFlow | Personal Finance',
  description: 'Manage your personal finance beautifully',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--glass-border)',
          padding: '16px 0',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ color: 'var(--accent-color)', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
              Finance<span style={{color: '#fff'}}>Flow</span>
            </h1>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="/" style={{ fontWeight: 500, opacity: 0.9 }}>Dashboard</a>
              <a href="/transactions" style={{ fontWeight: 500, opacity: 0.9 }}>Transactions</a>
            </div>
          </div>
        </nav>
        <main className="page-wrapper container">
          {children}
        </main>
      </body>
    </html>
  );
}
