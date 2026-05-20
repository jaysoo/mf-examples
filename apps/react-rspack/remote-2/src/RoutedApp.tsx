import { useState, type FormEvent } from 'react';
import './style.css';

interface Submitted {
  name: string;
  email: string;
  message: string;
}

export default function RoutedApp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState<Submitted | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted({ name, email, message });
  }

  return (
    <section className="remote remote-2" data-testid="remote-2">
      <h1>Remote 2 — Form</h1>
      <p>Controlled inputs rendered by the federated remote.</p>
      <form onSubmit={onSubmit} className="form">
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="form-name"
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="form-email"
            required
          />
        </label>
        <label>
          Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            data-testid="form-message"
            rows={3}
          />
        </label>
        <button type="submit" data-testid="form-submit">Submit</button>
      </form>
      {submitted && (
        <pre className="output" data-testid="form-output">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </section>
  );
}
