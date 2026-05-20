import { useEffect, useState } from 'react';
import styles from './app.module.css';

interface User {
  id: number;
  name: string;
  email: string;
}

export function App() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<User[]>;
      })
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={styles.root} data-testid="remote-3">
      <h1>Remote 3 — List</h1>
      <p>Data fetched at runtime by the federated Nx React remote.</p>
      {error && <p className={styles.error}>Failed to load: {error}</p>}
      {!users && !error && <p className={styles.loading}>Loading…</p>}
      {users && (
        <ul className={styles.users} data-testid="user-list">
          {users.map((u) => (
            <li key={u.id}>
              <strong>{u.name}</strong>
              <span className={styles.email}>{u.email}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default App;
