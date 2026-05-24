import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        color: '#333',
        background: 'linear-gradient(135deg, #f5f7fb 0%, #e8eef7 100%)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>화면을 표시할 수 없습니다</h1>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 20px', maxWidth: 480 }}>
          예상치 못한 오류가 발생했습니다. 새로고침하거나 잠시 후 다시 시도해 주세요.
        </p>
        <pre style={{
          fontSize: 12, color: '#a33', background: '#fff', border: '1px solid #fde2e2',
          borderRadius: 8, padding: '10px 14px', maxWidth: 720, overflow: 'auto', textAlign: 'left',
        }}>{error.message}</pre>
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={this.reset}
            style={{ padding: '8px 16px', border: '1px solid #4a7ab5', background: '#fff', color: '#4a7ab5', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >다시 시도</button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ padding: '8px 16px', border: 'none', background: '#4a7ab5', color: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >새로고침</button>
        </div>
      </div>
    );
  }
}
