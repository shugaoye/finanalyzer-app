import React, { useState, useEffect } from 'react';
import type { WidgetParameter } from '../../../types/widgets';
import FormOverlayModal from './FormOverlayModal';
import { Button } from '@openbb/ui';

interface FormParameterComponentProps {
  parameter: WidgetParameter;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  onSubmit?: (result: unknown) => void;
  disabled?: boolean;
  connectionUrl?: string;
}

const FormParameterComponent: React.FC<FormParameterComponentProps> = ({
  parameter,
  value,
  onChange,
  onSubmit,
  disabled = false,
  connectionUrl = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>(value || {});

  // Initialize form data from inputParams default values
  useEffect(() => {
    if (!value || Object.keys(value).length === 0) {
      const initialData: Record<string, unknown> = {};
      (parameter.inputParams || []).forEach(inputParam => {
        if (inputParam.type !== 'button') {
          initialData[inputParam.paramName] = inputParam.value || '';
        }
      });
      setFormData(initialData);
    } else {
      setFormData(value);
    }
  }, [value]);

  if (!parameter.inputParams || !parameter.endpoint) {
    return null;
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormDataChange = (data: Record<string, unknown>) => {
    setFormData(data);
    // 不在输入过程中调用 onChange，只在提交时更新
  };

  const handleFormSubmit = (result: unknown) => {
    // Clear form after submission
    const clearedFormData: Record<string, unknown> = {};
    (parameter.inputParams || []).forEach(inputParam => {
      if (inputParam.type !== 'button') {
        clearedFormData[inputParam.paramName] = inputParam.value || '';
      }
    });
    setFormData(clearedFormData);
    onChange(clearedFormData);

    if (onSubmit) {
      onSubmit(result);
    }
  };

  // Use parameter.paramName as button label, or fallback to description or label
  const buttonLabel = parameter.paramName || parameter.description || parameter.label || 'Open Form';

  return (
    <>
      {/* Button shown in parameter row */}
      <Button
        variant="primary"
        size="sm"
        onClick={handleOpenModal}
        disabled={disabled}
        aria-haspopup="dialog"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        {buttonLabel}
      </Button>

      {/* Modal overlay for form */}
      <FormOverlayModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        parameter={parameter}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onSubmit={handleFormSubmit}
        disabled={disabled}
        connectionUrl={connectionUrl}
      />
    </>
  );
};

export default FormParameterComponent;
