import * as React from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import styles from './app.module.css';

const Remote1 = React.lazy(() => import('remote1/Module'));
const Remote2 = React.lazy(() => import('remote2/Module'));
const Remote3 = React.lazy(() => import('remote3/Module'));

interface RemoteLink {
  path: string;
  name: string;
  desc: string;
}

const REMOTES: RemoteLink[] = [
  { path: '/remote1', name: 'Remote 1 — Counter', desc: 'useState counter exposed by remote1' },
  { path: '/remote2', name: 'Remote 2 — Form', desc: 'Controlled form exposed by remote2' },
  { path: '/remote3', name: 'Remote 3 — List', desc: 'JSONPlaceholder users list exposed by remote3' },
];

function Home() {
  return (
    <section data-testid="home">
      <h1>Module Federation Host (Nx React)</h1>
      <p>Three remotes are federated into this host via the Nx React generators. Click each route to load its remote module.</p>
      <ul className={styles.remoteList}>
        {REMOTES.map((r) => (
          <li key={r.path}>
            <Link to={r.path}>{r.name}</Link>
            <span className={styles.desc}>{r.desc}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Loading() {
  return <div className={styles.loading} role="status">Loading remote module…</div>;
}

export function App() {
  return (
    <>
      <nav className={styles.nav}>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/remote1">remote1</NavLink>
        <NavLink to="/remote2">remote2</NavLink>
        <NavLink to="/remote3">remote3</NavLink>
      </nav>
      <main className={styles.container}>
        <React.Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/remote1" element={<Remote1 />} />
            <Route path="/remote2" element={<Remote2 />} />
            <Route path="/remote3" element={<Remote3 />} />
          </Routes>
        </React.Suspense>
      </main>
    </>
  );
}

export default App;
