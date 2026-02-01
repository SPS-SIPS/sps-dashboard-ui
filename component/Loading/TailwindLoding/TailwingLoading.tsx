import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

export interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  iconSize?: 'small' | 'medium' | 'large' | 'xlarge';
  showPollingInterval?: boolean;
  pollingInterval?: number;
  className?: string;
  fullScreen?: boolean;
  spinnerColor?: string;
  details?: string[];
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  subMessage,
  iconSize = 'large',
  showPollingInterval = false,
  pollingInterval = 5000,
  className = '',
  fullScreen = true,
  spinnerColor = 'text-blue-600',
  details = [],
}) => {
  const sizeClasses: Record<NonNullable<LoadingSpinnerProps['iconSize']>, string> = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16',
  };

  const containerClasses = fullScreen 
    ? 'flex justify-center items-center min-h-screen' 
    : 'flex justify-center items-center p-6';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <FiRefreshCw 
          className={`${sizeClasses[iconSize]} animate-spin mx-auto ${spinnerColor}`}
          aria-label="Loading spinner"
        />
        {message && (
          <p className="mt-4 text-gray-600 text-lg font-medium">{message}</p>
        )}
        {subMessage && (
          <p className="mt-2 text-gray-500">{subMessage}</p>
        )}
        {details.map((detail, index) => (
          <p key={index} className="text-sm text-gray-400 mt-1">
            {detail}
          </p>
        ))}
        {showPollingInterval && pollingInterval && (
          <p className="text-sm text-gray-400 mt-3">
            Polling interval: {pollingInterval / 1000} seconds
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;