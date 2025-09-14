import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Server, Wifi, Lock, Eye, EyeOff } from 'lucide-react';

interface ErrorDiagnosticProps {
  error: string;
  onRetry: () => void;
}

const ErrorDiagnostic: React.FC<ErrorDiagnosticProps> = ({ error, onRetry }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getTroubleshootingSteps = (error: string) => {
    const steps = [
      {
        title: 'Check Backend Server',
        description: 'Make sure the backend server is running',
        command: 'cd backend && npm start',
        icon: Server,
        priority: 'high'
      }
    ];

    if (error.includes('fetch') || error.includes('connect')) {
      steps.push({
        title: 'Network Connection',
        description: 'Backend server might not be accessible',
        command: 'Check if http://localhost:5000 is accessible',
        icon: Wifi,
        priority: 'high'
      });
    }

    if (error.includes('401') || error.includes('Authentication')) {
      steps.push({
        title: 'Authentication Issue',
        description: 'Try logging out and logging back in',
        command: 'Clear browser cache and cookies',
        icon: Lock,
        priority: 'medium'
      });
    }

    if (error.includes('HTML') || error.includes('<!doctype')) {
      steps.push({
        title: 'API Proxy Configuration',
        description: 'Vite proxy might not be configured correctly',
        command: 'Restart frontend server: npm run dev',
        icon: RefreshCw,
        priority: 'high'
      });
    }

    return steps;
  };

  const steps = getTroubleshootingSteps(error);

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Dashboard Connection Error
          </h3>
          
          <div className="bg-red-100 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700 font-mono">{error}</p>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-red-700 hover:text-red-800 mb-4"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDetails ? 'Hide' : 'Show'} troubleshooting steps
          </button>

          {showDetails && (
            <div className="space-y-4 mb-4">
              <h4 className="font-medium text-red-800">Troubleshooting Steps:</h4>
              
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    step.priority === 'high' 
                      ? 'bg-orange-50 border-orange-400' 
                      : 'bg-yellow-50 border-yellow-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <step.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      step.priority === 'high' ? 'text-orange-600' : 'text-yellow-600'
                    }`} />
                    <div>
                      <h5 className="font-medium text-gray-800">{step.title}</h5>
                      <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {step.command}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-gray-800">Quick Setup Check</h5>
                    <p className="text-sm text-gray-600 mb-2">
                      Ensure both frontend and backend are running:
                    </p>
                    <div className="space-y-1 text-xs">
                      <div><code className="bg-gray-100 px-2 py-1 rounded">Frontend: npm run dev</code> (port 5173)</div>
                      <div><code className="bg-gray-100 px-2 py-1 rounded">Backend: cd backend && npm start</code> (port 5000)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDiagnostic;