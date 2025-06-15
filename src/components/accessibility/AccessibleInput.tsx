import { AlertCircle } from 'lucide-react';
import { AccessibleInputProps } from './types';

export function AccessibleInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  className,
  disabled = false,
  ...props
}: AccessibleInputProps) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span aria-label="Required" className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${helpText ? helpId : ''} ${error ? errorId : ''}`.trim()}
        className={`
          mobile-input w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
          ${error ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}
          ${className || ''}
        `}
        {...props}
      />
      
      {helpText && (
        <p id={helpId} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
} 