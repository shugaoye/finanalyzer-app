import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { WidgetParameter } from '../../../types/widgets';
import { isEndpointParameter } from '../../../types/widgets';
import { parameterService } from '../../../services/parameters/parameterService';
import { parameterDropdownClasses, parameterErrorClasses } from './ParameterStyles';
import { Button, Icon } from '@openbb/ui';

interface EndpointParameterComponentProps {
  parameter: WidgetParameter;
  value: string;
  onChange: (value: string) => void;
  widgetId: string;
  instanceId: string;
  disabled?: boolean;
}

const EndpointParameterComponent: React.FC<EndpointParameterComponentProps> = ({
  parameter,
  value,
  onChange,
  widgetId,
  instanceId,
  disabled = false,
}) => {
  const [options, setOptions] = useState<Array<{ value: unknown; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fetchOptions = useCallback(async () => {
    if (disabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedOptions = await parameterService.fetchParamOptions({
        parameter,
        widgetId,
        instanceId,
      });
      setOptions(fetchedOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load options');
      console.error('Error fetching endpoint parameter options:', err);
    } finally {
      setIsLoading(false);
    }
  }, [parameter, widgetId, instanceId, disabled]);

  // Fetch options when component mounts or when parameter changes
  useEffect(() => {
    if (isEndpointParameter(parameter)) {
      fetchOptions();
    }
  }, [parameter, widgetId, instanceId, disabled, fetchOptions]);

  const handleRefresh = useCallback(() => {
    fetchOptions();
  }, [fetchOptions]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isOpen) {
      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedOptionIndex((prev) => 
            (prev + 1) % options.length
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedOptionIndex((prev) => 
            prev === 0 ? options.length - 1 : prev - 1
          );
          break;
        case 'Enter':
        case ' ': 
          e.preventDefault();
          if (options[focusedOptionIndex]) {
            handleSelect(String(options[focusedOptionIndex].value));
          }
          break;
      }
    }
  };

  // Reset focused index when options change or dropdown opens
  useEffect(() => {
    setFocusedOptionIndex(0);
  }, [options, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isEndpointParameter(parameter)) {
    return null;
  }

  return (
    <div className="endpoint-parameter relative">
      <div className="flex items-center justify-between">
        <Button
          ref={buttonRef}
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading || disabled}
          onKeyDown={handleKeyDown}
          className={`w-full justify-between ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
        >
          <span>
            {value 
              ? options.find(opt => String(opt.value) === value)?.label || value
              : parameter.label || 'Select an option'
            }
          </span>
          <div className="flex items-center space-x-1">
            {isLoading && (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            )}
            {!isLoading && (
              <div className={`transition-transform ${isOpen ? 'transform rotate-180' : ''}`}>
                <Icon name={"chevron-down" as never} size={16} />
              </div>
            )}
          </div>
        </Button>
        {!isLoading && !disabled && (
          <Button
            variant="ghost"
            size="sm"
            icon
            onClick={handleRefresh}
            title="Refresh options"
            className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
          >
            <Icon name={"refresh-cw" as never} size={16} />
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between mt-1">
          <p className={parameterErrorClasses}>{error}</p>
          <Button
            variant="ghost"
            size="sm"
            icon
            onClick={handleRefresh}
            title="Retry"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
          >
            <Icon name={"refresh-cw" as never} size={14} />
          </Button>
        </div>
      )}

      {isOpen && !isLoading && !disabled && (
        <div ref={dropdownRef} className={parameterDropdownClasses.menu}>
          {options.length > 0 ? (
            options.map((option, index) => (
              <Button
                key={String(option.value)}
                variant="ghost"
                size="sm"
                onClick={() => handleSelect(String(option.value))}
                onKeyDown={handleKeyDown}
                className={`w-full text-left ${parameterDropdownClasses.item} ${value === String(option.value) ? parameterDropdownClasses.itemActive : parameterDropdownClasses.itemInactive} ${index === focusedOptionIndex ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
              >
                {option.label}
              </Button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EndpointParameterComponent;