import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Try the live demo',
  description:
    'Use seeded patron and DJ accounts to explore LiveQueue end-to-end in a few minutes.',
};

export default function DemoPage() {
  return (
    <main className="demo">
      <div className="demo__shell">
        <header className="demo__head">
          <p className="demo__eyebrow">
            <span className="dot" />
            Portfolio demo
          </p>
          <h1 className="demo__title">
            Try <em>LiveQueue</em> in two tabs.
          </h1>
          <p className="demo__lead">
            Open one window as a <strong>patron</strong> and another as the <strong>DJ</strong>. Submit a request on one
            screen and watch it land on the dashboard in real time.
          </p>
        </header>

        <section className="demo__section">
          <div className="demo__section-head">
            <span className="demo__section-num">01 / Setup</span>
            <h2 className="demo__section-title">One-time on your machine</h2>
          </div>
          <div className="demo__card">
            <p className="demo__p">
              Demo users and venues (<strong>Evolve</strong>, <strong>VyNX</strong>, <strong>Hyze</strong>) come from
              the Prisma seed. Run it once against your <strong>production</strong> database (same{' '}
              <code>DATABASE_URL</code> as Render).
            </p>
            <pre className="demo__pre demo__pre--has-marker" tabIndex={0}>{`cd backend
set DATABASE_URL=<your production postgres URL>
npm run prisma:seed`}</pre>
            <p className="demo__note">
              Free Render web services may sleep after idle time — the first load can take 30–60s. Refresh once.
            </p>
          </div>
        </section>

        <section className="demo__section">
          <div className="demo__section-head">
            <span className="demo__section-num">02 / Walk-through</span>
            <h2 className="demo__section-title">Sign in with these</h2>
          </div>
          <div className="demo__grid">
            <article className="demo__role-card">
              <p className="demo__role-label">Patron</p>
              <h3 className="demo__role-title"><em>The floor.</em></h3>
              <p className="demo__role-desc">Browse venues, send a request, watch live status updates.</p>
              <div className="demo__cred">
                <div className="demo__cred-row">
                  <span className="demo__cred-label">Email</span>
                  <span className="demo__cred-value">patron@test.com</span>
                </div>
                <div className="demo__cred-row">
                  <span className="demo__cred-label">Pass</span>
                  <span className="demo__cred-value">patron123</span>
                </div>
              </div>
              <div className="demo__role-cta">
                <Link href="/login" className="btn btn--bone">
                  Sign in as patron
                  <ArrowRight size={14} />
                </Link>
              </div>
              <p className="demo__hint">
                Then open <Link href="/venues">Venues</Link> and pick Evolve, VyNX, or Hyze.
              </p>
            </article>

            <article className="demo__role-card demo__role-card--dj">
              <p className="demo__role-label">DJ</p>
              <h3 className="demo__role-title"><em>The booth.</em></h3>
              <p className="demo__role-desc">Accept, decline, or mark requests as played in real time.</p>
              <div className="demo__cred">
                <div className="demo__cred-row">
                  <span className="demo__cred-label">Email</span>
                  <span className="demo__cred-value">dj@test.com</span>
                </div>
                <div className="demo__cred-row">
                  <span className="demo__cred-label">Pass</span>
                  <span className="demo__cred-value">dj123</span>
                </div>
              </div>
              <div className="demo__role-cta">
                <Link href="/dj/login" className="btn btn--primary">
                  Sign in as DJ
                  <ArrowRight size={14} />
                </Link>
              </div>
              <p className="demo__hint">
                Then open the <Link href="/dj">DJ dashboard</Link> for the live queue.
              </p>
            </article>
          </div>
        </section>

        <p className="demo__footer">
          Credentials are demo-only · For a real launch, remove or rotate seeded accounts
        </p>
      </div>
    </main>
  );
}
