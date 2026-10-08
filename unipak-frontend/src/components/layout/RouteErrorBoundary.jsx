import React from 'react';

export default class RouteErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('A page failed to render', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-container flex min-h-[60vh] items-center justify-center">
          <div className="max-w-lg text-center">
            <h1 className="page-heading mb-3">This section could not be displayed</h1>
            <p className="page-copy">Choose another section from the navigation to continue.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
