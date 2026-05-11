import React from 'react';

const Button = ({ 
  children, 
  loading = false, 
  disabled = false, 
  className = '', 
  variant = 'primary', 
  type = 'button',
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-outline';
  
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <div className="spinner"></div>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
