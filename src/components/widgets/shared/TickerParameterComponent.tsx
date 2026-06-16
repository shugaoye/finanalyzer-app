import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { WidgetParameter, ParameterOption } from '../../../types/widgets';
import { parameterService } from '../../../services/parameters/parameterService';

interface TickerParameterComponentProps {
  parameter: WidgetParameter;
  value: string;
  onChange: (value: string) => void;
  widgetId: string;
  instanceId: string;
  disabled?: boolean;
  connectionUrl?: string;
}

// Recent tickers stored in localStorage
const RECENT_TICKERS_KEY = 'finanalyzer_recent_tickers';
const MAX_RECENT = 5;

function getRecentTickers(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_TICKERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentTicker(ticker: string) {
  if (!ticker.trim()) return;
  const recent = getRecentTickers().filter(t => t !== ticker);
  recent.unshift(ticker);
  localStorage.setItem(RECENT_TICKERS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

const TickerParameterComponent: React.FC<TickerParameterComponentProps> = ({
  parameter,
  value,
  onChange,
  widgetId,
  instanceId,
  disabled = false,
  connectionUrl,
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<ParameterOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes to input
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Calculate dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current && isFocused) {
      const rect = inputRef.current.getBoundingClientRect();
      const popupW = Math.max(rect.width, 280);
      const left = Math.min(rect.left, window.innerWidth - popupW - 8);
      setDropdownPos({
        top: rect.bottom + 2,
        left: Math.max(left, 4),
        width: popupW,
      });
    }
  }, [isFocused]);

  useEffect(() => {
    updateDropdownPosition();
  }, [isFocused, updateDropdownPosition]);

  // Recalculate on scroll/resize
  useEffect(() => {
    if (!isFocused) return;
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isFocused, updateDropdownPosition]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for tickers via the parameterService
  const searchTickers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await parameterService.searchTickers({
          query,
          widgetId,
          instanceId,
          baseUrl: connectionUrl || undefined,
          paramName: parameter.name || parameter.paramName || 'symbol',
        });
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching tickers:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [widgetId, instanceId, connectionUrl, parameter.name, parameter.paramName],
  );

  // Handle input change with debounce
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      setFocusedIndex(-1);

      // Debounce search
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        searchTickers(newValue);
      }, 300);
    },
    [searchTickers],
  );

  // Handle selecting a ticker from dropdown
  const handleSelectTicker = useCallback(
    (option: ParameterOption) => {
      const tickerValue = String(option.value);
      addRecentTicker(tickerValue);
      setInputValue(tickerValue);
      onChange(tickerValue);
      setIsFocused(false);
      setSearchResults([]);
    },
    [onChange],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const recentTickers = getRecentTickers();
      const totalItems = searchResults.length + (recentTickers.length > 0 ? recentTickers.length : 0);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % Math.max(totalItems, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev <= 0 ? totalItems - 1 : prev - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0) {
            // Determine if focused item is in recent or search results
            const recentCount = recentTickers.length;
            if (focusedIndex < recentCount && recentCount > 0) {
              const recentItem = recentTickers[focusedIndex];
              addRecentTicker(recentItem);
              setInputValue(recentItem);
              onChange(recentItem);
            } else if (searchResults.length > 0) {
              const resultIndex = focusedIndex - recentCount;
              if (resultIndex >= 0 && resultIndex < searchResults.length) {
                handleSelectTicker(searchResults[resultIndex]);
              }
            }
            setIsFocused(false);
          } else {
            // No item focused, commit the current input
            onChange(inputValue);
            addRecentTicker(inputValue);
            setIsFocused(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsFocused(false);
          break;
        case ',':
          // Comma is allowed for multi-ticker input — commit current
          if (inputValue.trim()) {
            onChange(inputValue);
          }
          break;
      }
    },
    [focusedIndex, searchResults, handleSelectTicker, onChange, inputValue],
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setFocusedIndex(-1);
    // Show recent tickers if input is empty
    if (!inputValue.trim()) {
      searchTickers('');
    }
  }, [inputValue, searchTickers]);

  // Handle blur with delay to allow click on dropdown items
  const handleBlur = useCallback(() => {
    // Delay to allow dropdown item click to register
    setTimeout(() => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(document.activeElement) &&
        inputRef.current &&
        !inputRef.current.contains(document.activeElement)
      ) {
        // Commit the current value on blur
        if (inputValue !== value) {
          onChange(inputValue);
          if (inputValue.trim()) {
            addRecentTicker(inputValue.trim());
          }
        }
        setIsFocused(false);
      }
    }, 150);
  }, [inputValue, value, onChange]);

  // Recent tickers for display
  const recentTickers = useMemo(() => getRecentTickers(), [isFocused]);

  // Whether to show the dropdown
  const showDropdown = isFocused && !disabled;

  // Render dropdown via portal
  const dropdownEl =
    showDropdown && dropdownPos ? (
      <div
        ref={dropdownRef}
        className="fixed z-[9999] bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-md shadow-lg overflow-hidden"
        style={{
          top: `${dropdownPos.top}px`,
          left: `${dropdownPos.left}px`,
          width: `${dropdownPos.width}px`,
          maxWidth: '90vw',
        }}
      >
        {isSearching && (
          <div className="flex items-center justify-center py-3">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {!isSearching && (
          <>
            {/* Recent tickers section */}
            {recentTickers.length > 0 && !inputValue.trim() && (
              <div>
                <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 dark:text-dark-400 uppercase tracking-wider">
                  Recent
                </div>
                {recentTickers.map((ticker, index) => (
                  <div
                    key={`recent-${ticker}`}
                    className={`w-full px-2 py-1.5 rounded cursor-pointer text-left text-xs flex items-center transition-colors ${
                      focusedIndex === index
                        ? 'bg-[#CCDEEE] dark:bg-[#36363F]'
                        : 'hover:bg-[#CCDEEE] dark:hover:bg-[#36363F]'
                    } text-gray-900 dark:text-white`}
                    onClick={() => {
                      addRecentTicker(ticker);
                      setInputValue(ticker);
                      onChange(ticker);
                      setIsFocused(false);
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <span className="font-medium">{ticker}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Search results section */}
            {searchResults.length > 0 && (
              <div>
                {recentTickers.length > 0 && !inputValue.trim() && (
                  <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 dark:text-dark-400 uppercase tracking-wider border-t border-gray-100 dark:border-dark-700">
                    Top Results
                  </div>
                )}
                {recentTickers.length === 0 && (
                  <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 dark:text-dark-400 uppercase tracking-wider">
                    Results
                  </div>
                )}
                {searchResults.map((option, index) => {
                  const adjustedIndex = recentTickers.length > 0 && !inputValue.trim()
                    ? recentTickers.length + index
                    : index;
                  return (
                    <div
                      key={String(option.value)}
                      className={`w-full whitespace-nowrap px-2 py-1.5 rounded cursor-pointer text-left text-xs flex items-center gap-2 transition-colors ${
                        focusedIndex === adjustedIndex
                          ? 'bg-[#CCDEEE] dark:bg-[#36363F]'
                          : 'hover:bg-[#CCDEEE] dark:hover:bg-[#36363F]'
                      } text-gray-900 dark:text-white`}
                      onClick={() => handleSelectTicker(option)}
                      onMouseEnter={() => setFocusedIndex(adjustedIndex)}
                    >
                      {/* Label */}
                      <span className="truncate">{option.label}</span>
                      {/* Extra info */}
                      {option.extraInfo && (option.extraInfo.description || option.extraInfo.rightOfDescription) && (
                        <span className="uppercase tracking-wide flex gap-1 ml-auto flex-shrink-0">
                          {option.extraInfo.description && (
                            <span className="text-gray-500 dark:text-[#8A8A90]">
                              {option.extraInfo.description}
                            </span>
                          )}
                          {option.extraInfo.rightOfDescription && (
                            <span className="text-gray-900 dark:text-white">
                              {option.extraInfo.rightOfDescription}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* No results */}
            {!isSearching && inputValue.trim() && searchResults.length === 0 && (
              <div className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                No matching tickers found
              </div>
            )}

            {/* Empty state with no recent and no search */}
            {!isSearching && !inputValue.trim() && recentTickers.length === 0 && (
              <div className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                Type to search for tickers
              </div>
            )}
          </>
        )}
      </div>
    ) : null;

  return (
    <div ref={containerRef} className="ticker-parameter">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={parameter.description || parameter.label || 'Search ticker...'}
        className="obb-minimal-input bg-transparent dark:bg-transparent px-0 h-[18.8px]! border-none! w-[120px] min-w-[96px] max-w-[200px] text-xs text-grey-900 dark:text-grey-100 placeholder:text-grey-500 dark:placeholder:text-grey-400 focus:outline-none"
      />
      {dropdownEl && createPortal(dropdownEl, document.body)}
    </div>
  );
};

export default TickerParameterComponent;
