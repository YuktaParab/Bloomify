import React from 'react';

/**
 * Card Component - Flexible container for content
 * Usage: <Card> <Card.Header /> <Card.Body /> <Card.Footer /> </Card>
 */
export const Card = ({ children, className = '', variant = 'default', hover = true }) => {
  const baseClass = 'rounded-lg border transition-all duration-300';
  const variantClass = {
    default: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm',
    elevated: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-md',
    outlined: 'bg-transparent border-gray-300 dark:border-gray-700',
    accent: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
  };
  const hoverClass = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';

  return (
    <div className={`${baseClass} ${variantClass[variant]} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-800 ${className}`}>
    {children}
  </div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg ${className}`}>
    {children}
  </div>
);

/**
 * Button Component - Unified button system
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseClass = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500';
  
  const sizeClass = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2',
    xl: 'px-8 py-4 text-lg gap-2'
  };

  const variantClass = {
    primary: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
    outlined: 'border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950',
    ghost: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseClass} ${sizeClass[size]} ${variantClass[variant]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Badge Component - Status badges and tags
 */
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantClass = {
    default: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white',
    success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    info: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    accent: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClass[variant]} ${className}`}>
      {children}
    </span>
  );
};

/**
 * Input Component - Form input with consistent styling
 */
export const Input = ({ 
  label = '', 
  error = '', 
  helperText = '',
  fullWidth = true,
  className = '',
  ...props 
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 rounded-lg
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          text-gray-900 dark:text-white
          placeholder-gray-500 dark:placeholder-gray-400
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
          disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
          ${error ? 'ring-2 ring-red-500 border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{helperText}</p>}
    </div>
  );
};

/**
 * Section Component - Page section wrapper with consistent spacing
 */
export const Section = ({ 
  children, 
  title = '',
  subtitle = '',
  className = '',
  container = true
}) => {
  return (
    <section className={`py-16 lg:py-20 ${className}`}>
      <div className={container ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : ''}>
        {(title || subtitle) && (
          <div className="mb-12">
            {title && <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>}
            {subtitle && <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

/**
 * Grid Component - Responsive grid layout
 */
export const Grid = ({ 
  children, 
  cols = 3,
  gap = 6,
  className = '' 
}) => {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
  };

  const gapClass = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };

  return (
    <div className={`grid ${colClass[cols]} ${gapClass[gap]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Modal Component - Dialog/modal wrapper
 */
export const Modal = ({ 
  isOpen = false, 
  onClose = () => {}, 
  title = '',
  children,
  size = 'md'
}) => {
  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white dark:bg-gray-900 rounded-xl shadow-xl ${sizeClass[size]} w-full mx-4`}>
        {title && (
          <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
        )}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * LoadingState Component - Loading skeleton
 */
export const LoadingState = ({ count = 3, cardHeight = 200 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse h-${cardHeight}`} />
    ))}
  </div>
);

/**
 * EmptyState Component - Empty state template
 */
export const EmptyState = ({ 
  icon: Icon, 
  title = 'No items found',
  description = '',
  action = null
}) => (
  <div className="text-center py-12">
    {Icon && (
      <div className="flex justify-center mb-4">
        <Icon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    {description && <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>}
    {action && <div>{action}</div>}
  </div>
);

export default {
  Card,
  Button,
  Badge,
  Input,
  Section,
  Grid,
  Modal,
  LoadingState,
  EmptyState
};
