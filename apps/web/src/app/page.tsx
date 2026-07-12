import React from 'react';

export default function Home() {
  const modules = [
    {
      title: 'Identity & Access',
      description: 'Multi-tenant secure authentication. Public signups initialize scoped Employee accounts. Admins promote Managers and Department Heads.',
      badge: 'Secure'
    },
    {
      title: 'Asset Registry',
      description: 'Track physical assets through their entire lifecycle. Fully audited statuses: Available, Allocated, Reserved, Under Maintenance, Lost, Retired, and Disposed.',
      badge: 'Core'
    },
    {
      title: 'Allocations & Transfers',
      description: 'Controlled allocation workflows for employees and departments. Strict database constraints prevent double allocations.',
      badge: 'Transactional'
    },
    {
      title: 'Resource Booking',
      description: 'Reserve shared company resources. PostgreSQL range exclusion constraints prevent overlapping time slots.',
      badge: 'Database Guaranteed'
    },
    {
      title: 'Maintenance Requests',
      description: 'Route physical assets through request, approval, and repair phases. Automatic status transitions keep registry records up-to-date.',
      badge: 'Workflows'
    },
    {
      title: 'Scheduled Audits',
      description: 'Run scheduled audit cycles with assigned auditors. Discrepancy handling and immutable closed logs ensure compliance.',
      badge: 'Compliance'
    }
  ];

  return (
    <main style={{ minHeight: '100vh', padding: '4rem 2rem', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: '#a78bfa', border: '1px solid rgba(167, 139, 250, 0.2)', marginBottom: '1.5rem' }}>
          AssetFlow Enterprise Platform
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>
          <span className="text-gradient">AssetFlow Portal</span>
        </h1>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
          Enterprise Asset & Resource Management System. Guaranteed invariant enforcement via database constraints, built for high-scale multi-tenant operations.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button className="btn-primary">Launch Dashboard</button>
          <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            Documentation
          </button>
        </div>
      </header>

      {/* Modules Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
        {modules.map((m, idx) => (
          <div key={idx} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 600 }}>{m.title}</h3>
                <span className="badge badge-allocated" style={{ background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)', fontSize: '0.7rem' }}>
                  {m.badge}
                </span>
              </div>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                {m.description}
              </p>
            </div>
            <a href="#" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Explore Module &rarr;
            </a>
          </div>
        ))}
      </section>

      {/* Footer Info */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2.5rem', textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
        <p>&copy; {new Date().getFullYear()} AssetFlow Monorepo. All rights reserved. Platform integrity backed by PostgreSQL & Redis.</p>
      </footer>
    </main>
  );
}
