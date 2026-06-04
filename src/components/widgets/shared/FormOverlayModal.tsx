import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { WidgetParameter, FormInputParameter } from '../../../types/widgets';
import { parameterService } from '../../../services/parameters/parameterService';
import { parameterFormClasses, parameterFormGroupClasses, parameterInputClasses, parameterSelectClasses, parameterCheckboxClasses, parameterErrorClasses, parameterSuccessClasses, parameterErrorContainerClasses } from './ParameterStyles';
import { Button } from '@openbb/ui';

interface FormOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  parameter: WidgetParameter;
  formData: Record<string, unknown>;
  onFormDataChange: (data: Record<string, unknown>) => void;
  onSubmit?: (result: unknown) => void;
  disabled?: boolean;
  connectionUrl?: string;
}

const FormOverlayModal: React.FC<FormOverlayModalProps> = ({
  isOpen,
  onClose,
  parameter,
  formData,
  onFormDataChange,
  onSubmit,
  disabled = false,
  connectionUrl = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [firstInputElement, setFirstInputElement] = useState<HTMLElement | null>(null);

  // Focus management: focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => {
        if (firstInputElement) {
          firstInputElement.focus();
        } else if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, firstInputElement]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    
    // Trap focus inside modal (Tab key handling)
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (paramName: string, inputValue: unknown) => {
    onFormDataChange({
      ...formData,
      [paramName]: inputValue,
    });

    if (errors[paramName]) {
      const newErrors = { ...errors };
      delete newErrors[paramName];
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    (parameter.inputParams || []).forEach(inputParam => {
      if (inputParam.type === 'button') {
        return;
      }

      const inputValue = formData[inputParam.paramName];

      if (inputParam.required && (inputValue === undefined || inputValue === null || inputValue === '')) {
        newErrors[inputParam.paramName] = `${inputParam.label} is required`;
        return;
      }

      switch (inputParam.type) {
        case 'number':
          if (inputValue !== undefined && inputValue !== null) {
            const numValue = typeof inputValue === 'string' ? parseFloat(inputValue as string) : inputValue;
            if (isNaN(numValue as number)) {
              newErrors[inputParam.paramName] = `${inputParam.label} must be a number`;
            } else if (inputParam.min !== undefined && (numValue as number) < inputParam.min) {
              newErrors[inputParam.paramName] = `${inputParam.label} must be at least ${inputParam.min}`;
            } else if (inputParam.max !== undefined && (numValue as number) > inputParam.max) {
              newErrors[inputParam.paramName] = `${inputParam.label} must be at most ${inputParam.max}`;
            }
          }
          break;

        case 'date':
          if (inputValue !== undefined && inputValue !== null) {
            if (isNaN(Date.parse(String(inputValue)))) {
              newErrors[inputParam.paramName] = `${inputParam.label} must be a valid date`;
            }
          }
          break;

        case 'select':
          if (inputValue !== undefined && inputValue !== null && inputParam.options) {
            const optionValues = inputParam.options.map(opt => opt.value);
            if (!optionValues.includes(inputValue as string)) {
              newErrors[inputParam.paramName] = `${inputParam.label} must be a valid option`;
            }
          }
          break;

        default:
          break;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const result = await parameterService.submitFormParameter(parameter, formData, connectionUrl);
      setSubmitSuccess('Form submitted successfully');
      setSubmitError(null);

      // Clear form after successful submission
      const clearedFormData: Record<string, unknown> = {};
      (parameter.inputParams || []).forEach(inputParam => {
        if (inputParam.type !== 'button') {
          clearedFormData[inputParam.paramName] = inputParam.value || '';
        }
      });
      onFormDataChange(clearedFormData);

      if (onSubmit) {
        onSubmit(result);
      }

      // Close modal after successful submission
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit form');
      setSubmitSuccess(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormInput = (inputParam: FormInputParameter, index: number) => {
    const inputValue = formData[inputParam.paramName];
    const error = errors[inputParam.paramName];
    const isFirstInput = index === 0;

    switch (inputParam.type) {
      case 'string':
      case 'text':
        return (
          <div key={inputParam.paramName} className={parameterFormGroupClasses}>
            <label 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              htmlFor={`form-input-${inputParam.paramName}`}
            >
              {inputParam.label}
              {inputParam.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              id={`form-input-${inputParam.paramName}`}
              ref={isFirstInput ? setFirstInputElement : undefined}
              type="text"
              value={inputValue as string || ''}
              onChange={(e) => handleInputChange(inputParam.paramName, e.target.value)}
              className={`${parameterInputClasses.base} ${error ? parameterInputClasses.error : ''} ${disabled ? parameterInputClasses.disabled : ''}`}
              placeholder={inputParam.description || inputParam.label}
              disabled={disabled}
              aria-describedby={error ? `error-${inputParam.paramName}` : undefined}
            />
            {error && (
              <p id={`error-${inputParam.paramName}`} className={parameterErrorClasses} role="alert">
                {error}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={inputParam.paramName} className={parameterFormGroupClasses}>
            <label 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              htmlFor={`form-input-${inputParam.paramName}`}
            >
              {inputParam.label}
              {inputParam.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              id={`form-input-${inputParam.paramName}`}
              ref={isFirstInput ? setFirstInputElement : undefined}
              type="number"
              value={inputValue as number || ''}
              onChange={(e) => handleInputChange(inputParam.paramName, parseFloat(e.target.value) || '')}
              className={`${parameterInputClasses.base} ${error ? parameterInputClasses.error : ''} ${disabled ? parameterInputClasses.disabled : ''}`}
              placeholder={inputParam.description || inputParam.label}
              min={inputParam.min}
              max={inputParam.max}
              step={inputParam.step}
              disabled={disabled}
              aria-describedby={error ? `error-${inputParam.paramName}` : undefined}
            />
            {error && (
              <p id={`error-${inputParam.paramName}`} className={parameterErrorClasses} role="alert">
                {error}
              </p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={inputParam.paramName} className={parameterFormGroupClasses}>
            <div className="flex items-center">
              <input
                id={`form-input-${inputParam.paramName}`}
                ref={isFirstInput ? setFirstInputElement : undefined}
                type="checkbox"
                checked={Boolean(inputValue)}
                onChange={(e) => handleInputChange(inputParam.paramName, e.target.checked)}
                className={parameterCheckboxClasses}
                disabled={disabled}
              />
              <label 
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                htmlFor={`form-input-${inputParam.paramName}`}
              >
                {inputParam.label}
              </label>
            </div>
            {error && (
              <p id={`error-${inputParam.paramName}`} className={parameterErrorClasses} role="alert">
                {error}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={inputParam.paramName} className={parameterFormGroupClasses}>
            <label 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              htmlFor={`form-input-${inputParam.paramName}`}
            >
              {inputParam.label}
              {inputParam.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={`form-input-${inputParam.paramName}`}
              ref={isFirstInput ? setFirstInputElement : undefined}
              value={inputValue as string || ''}
              onChange={(e) => handleInputChange(inputParam.paramName, e.target.value)}
              className={`${parameterSelectClasses.base} ${error ? parameterSelectClasses.error : ''} ${disabled ? parameterSelectClasses.disabled : ''}`}
              disabled={disabled}
              aria-describedby={error ? `error-${inputParam.paramName}` : undefined}
            >
              <option value="">Select {inputParam.label}</option>
              {inputParam.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && (
              <p id={`error-${inputParam.paramName}`} className={parameterErrorClasses} role="alert">
                {error}
              </p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={inputParam.paramName} className={parameterFormGroupClasses}>
            <label 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              htmlFor={`form-input-${inputParam.paramName}`}
            >
              {inputParam.label}
              {inputParam.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              id={`form-input-${inputParam.paramName}`}
              ref={isFirstInput ? setFirstInputElement : undefined}
              type="date"
              value={inputValue as string || ''}
              onChange={(e) => handleInputChange(inputParam.paramName, e.target.value)}
              className={`${parameterInputClasses.base} ${error ? parameterInputClasses.error : ''} ${disabled ? parameterInputClasses.disabled : ''}`}
              disabled={disabled}
              aria-describedby={error ? `error-${inputParam.paramName}` : undefined}
            />
            {error && (
              <p id={`error-${inputParam.paramName}`} className={parameterErrorClasses} role="alert">
                {error}
              </p>
            )}
          </div>
        );

      case 'button':
        return null;

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const buttonParam = parameter.inputParams?.find(p => p.type === 'button');

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-modal-title"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop with fade transition */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="relative bg-white dark:bg-dark-900 rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 ease-in-out scale-100 opacity-100"
          role="document"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
            <h2 
              id="form-modal-title" 
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {parameter.description || parameter.label || 'Form'}
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800"
              aria-label="Close modal"
              type="button"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
          
          {/* Form content */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className={parameterFormClasses}>
              {parameter.inputParams?.map((inputParam, index) => renderFormInput(inputParam, index))}
            </div>
            
            {/* Submit button */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isSubmitting || disabled}
              >
                {isSubmitting ? 'Submitting...' : buttonParam?.label || 'Submit'}
              </Button>
            </div>

            {/* Error/Success messages */}
            {submitError && (
              <div className={`${parameterErrorContainerClasses} mt-4`} role="alert">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className={`${parameterSuccessClasses} mt-4`} role="status">
                {submitSuccess}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormOverlayModal;
