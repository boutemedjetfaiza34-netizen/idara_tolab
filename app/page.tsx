import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="public-layout">
      {/* Header */}
      <header className="public-header">
        <div className="public-header-logo">
          <div className="header-logo-box">
            <img src="/logo.png" alt="Logo" className="site-logo-img" />
          </div>
          <span className="logo-text">دروس الدعم في العلوم الطبيعية</span>
        </div>
      </header>

      {/* Main */}
      <main className="public-main">
        {/* Hero */}
        <div className="hero">
          <div className="hero-logo-wrapper">
            <img src="/logo.png" alt="Boutemdjet Logo" className="site-logo-hero" />
          </div>

          <div className="hero-badge">
            <span>🧬</span>
            <span>دروس الدعم في العلوم الطبيعية</span>
          </div>

          <h1 className="hero-title">
            الأستاذة بوتمجت فايزة
          </h1>

          <h2 className="hero-subtitle">
            علوم الطبيعة و الحياة
          </h2>

          <p className="hero-description">
            سجّل في الفوج المناسب لك واحتفظ بمعلومات التسجيل.
          </p>
        </div>

        {/* Group Cards */}
        <div className="groups-grid">
          {/* Group 1 */}
          <Link href="/register/group-1" prefetch={true} style={{ display: 'block' }}>
            <div className="group-card">
              <div className="group-card-icon-box">
                🔬
              </div>
              <div className="group-card-number">الفوج 1</div>
              <div className="group-card-label">المجموعة الأولى</div>
              <span className="btn btn-primary" style={{ display: 'inline-flex', width: '100%' }}>
                التسجيل في الفوج 1
              </span>
            </div>
          </Link>

          {/* Group 2 */}
          <Link href="/register/group-2" prefetch={true} style={{ display: 'block' }}>
            <div className="group-card">
              <div className="group-card-icon-box">
                🧪
              </div>
              <div className="group-card-number">الفوج 2</div>
              <div className="group-card-label">المجموعة الثانية</div>
              <span className="btn btn-primary" style={{ display: 'inline-flex', width: '100%' }}>
                التسجيل في الفوج 2
              </span>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="public-footer">
        دروس الدعم — الأستاذة بوتمجت فايزة · علوم الطبيعة والحياة
      </footer>
    </div>
  );
}
