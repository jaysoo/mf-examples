import { Link } from 'react-router-dom';

const remotes = [
  { path: '/remote-1', name: 'Remote 1 — Counter', desc: 'useState counter exposed by remote-1' },
  { path: '/remote-2', name: 'Remote 2 — Form', desc: 'Controlled form exposed by remote-2' },
  { path: '/remote-3', name: 'Remote 3 — List', desc: 'JSONPlaceholder users list exposed by remote-3' },
];

export function Home() {
  return (
    <section data-testid="home">
      <h1>Module Federation Host</h1>
      <p>Three remotes are federated into this host. Click each route to load its remote module.</p>
      <ul className="remote-list">
        {remotes.map((r) => (
          <li key={r.path}>
            <Link to={r.path}>{r.name}</Link>
            <span className="desc">{r.desc}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
