import { useState } from 'react';
import './style.css';

export default function RoutedApp() {
  const [count, setCount] = useState(0);
  return (
    <section className="remote remote-1" data-testid="remote-1">
      <h1>Remote 1 — Counter</h1>
      <p>Local state managed inside the federated remote.</p>
      <p className="count" data-testid="counter-value">
        {count}
      </p>
      <div className="controls">
        <button onClick={() => setCount((c) => c - 1)} aria-label="decrement">-</button>
        <button onClick={() => setCount(0)} aria-label="reset">reset</button>
        <button onClick={() => setCount((c) => c + 1)} aria-label="increment">+</button>
      </div>
    </section>
  );
}
