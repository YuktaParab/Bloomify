import React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import AnimatedButton from "./AnimatedButton";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 glass-panel m-8 text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-(--text)">Something went wrong</h2>
          <p className="text-(--text-secondary) max-w-md">
            We encountered an error while rendering this module. We've logged the error and are working to fix it.
          </p>
          <div className="flex gap-4">
             <AnimatedButton 
               variant="primary" 
               onClick={() => window.location.reload()}
               icon={RefreshCcw}
             >
               Reload Page
             </AnimatedButton>
             <AnimatedButton 
               variant="secondary" 
               onClick={() => this.setState({ hasError: false })}
             >
               Try Again
             </AnimatedButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
