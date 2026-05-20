import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class RemoteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown): void {
    console.error('Remote module failed to load:', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="remote-error" role="alert">
          <h2>Failed to load remote module</h2>
          <pre>{this.state.error.message}</pre>
          <button onClick={this.reset}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}
