import { useState } from 'react';
import styles from './app.module.css';

export function App() {
  const [count, setCount] = useState(0);
  return (
    <section className={styles.root} data-testid="remote-1">
      <h1>Remote 1 — Counter</h1>
      <p>Local state managed inside the federated Nx React remote.</p>
      <p className={styles.count} data-testid="counter-value">{count}</p>
      <div className={styles.controls}>
        <button onClick={() => setCount((c) => c - 1)} aria-label="decrement">-</button>
        <button onClick={() => setCount(0)} aria-label="reset">reset</button>
        <button onClick={() => setCount((c) => c + 1)} aria-label="increment">+</button>
      </div>
    </section>
  );
}

export default App;
