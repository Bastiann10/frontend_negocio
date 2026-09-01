import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface SearchableMultiSelectProps<T> {
  options: T[];
  value: Set<number>;
  onChange: (value: Set<number>) => void;
  getLabel: (option: T) => string;
  getSubLabel?: (option: T) => string;
  getId: (option: T) => number;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchableMultiSelect<T>({
  options,
  value,
  onChange,
  getLabel,
  getSubLabel,
  getId,
  placeholder = 'Seleccionar...',
  disabled = false,
}: SearchableMultiSelectProps<T>) {
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

  const handleToggle = (id: number) => {
    const newSelection = new Set(value);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onChange(newSelection);
  };

  const handleClear = () => {
    onChange(new Set());
    setSearchTerm('');
  };

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const selectedCount = value.size;
  const displayValue = selectedCount > 0 
    ? `${selectedCount} tarjeta(s) seleccionada(s)` 
    : searchTerm;

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
          className="w-full px-4 py-2 pr-20   rounded-lg focus:ring-2 focus:ring-focus-ring focus:border-transparent outline-none disabled:bg-background-secondary disabled:cursor-not-allowed bg-background text-foreground"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {selectedCount > 0 && (
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
            onClick={handleToggleDropdown}
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
              const id = getId(option);
              const isSelected = value.has(id);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleToggle(id)}
                  className={`w-full px-4 py-2 text-left hover:bg-background-secondary transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-background-secondary' : ''
                  }`}
                >
                  <div>
                    <div className="font-medium text-foreground">{getLabel(option)}</div>
                    {getSubLabel && (
                      <div className="text-sm text-foreground-secondary">{getSubLabel(option)}</div>
                    )}
                  </div>
                  <div className={`w-4 h-4 rounded border ${
                    isSelected
                      ? 'bg-primary border-slate-600'
                      : 'border-border'
                  }`} />
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
