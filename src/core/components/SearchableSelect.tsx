import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface SearchableSelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  getLabel: (option: T) => string;
  getSubLabel?: (option: T) => string;
  placeholder?: string;
  disabled?: boolean;
  onSearch?: (searchTerm: string) => void;
  showSearchButton?: boolean;
}

export default function SearchableSelect<T>({
  options,
  value,
  onChange,
  getLabel,
  getSubLabel,
  placeholder = 'Seleccionar...',
  disabled = false,
  onSearch,
  showSearchButton = false,
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar opciones basadas en el término de búsqueda
  const filteredOptions = options.filter(option =>
    getLabel(option).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (getSubLabel && getSubLabel(option).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (option: T) => {
    onChange(option);
    setSearchTerm(getLabel(option));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const displayValue = value ? getLabel(value) : searchTerm;

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2   bg-background text-foreground rounded-lg focus:ring-2 focus:ring-focus-ring focus:border-transparent outline-none disabled:bg-background-secondary disabled:cursor-not-allowed ${
            showSearchButton ? 'pr-32' : 'pr-20'
          }`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showSearchButton && (
            <button
              type="button"
              onClick={handleSearchClick}
              className="p-1 hover:bg-background-secondary rounded cursor-pointer"
              disabled={disabled}
            >
              <Search size={16} className="text-foreground-secondary" />
            </button>
          )}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-background-secondary rounded cursor-pointer"
              disabled={disabled}
            >
              <X size={16} className="text-foreground-secondary" />
            </button>
          )}
          <button
            type="button"
            onClick={handleToggle}
            className="p-1 hover:bg-background-secondary rounded cursor-pointer"
            disabled={disabled}
          >
            <ChevronDown size={16} className={`text-foreground-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-background   rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-foreground-secondary">
              No se encontraron resultados
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = value && getLabel(value) === getLabel(option);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-2 text-left hover:bg-background-secondary transition-colors ${
                    isSelected ? 'bg-background-secondary' : ''
                  }`}
                >
                  <div className="font-medium text-foreground">{getLabel(option)}</div>
                  {getSubLabel && (
                    <div className="text-sm text-foreground-secondary">{getSubLabel(option)}</div>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
