import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erreur capturée par ErrorBoundary:', error, info);
  }
//
  render() {
    if (this.state.hasError) {
      return <h1>Une erreur s'est produite. Veuillez réessayer plus tard.</h1>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;