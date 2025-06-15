import { exportOptions } from '@/constants/exportOptions';

interface DataTypeSelectorProps {
  selectedOptions: string[];
  onToggleOption: (optionId: string) => void;
}

export function DataTypeSelector({ selectedOptions, onToggleOption }: DataTypeSelectorProps) {
  return (
    <div>
      <p className="text-sm font-medium mb-3">Select data to export:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedOptions.includes(option.id);
          
          return (
            <button
              key={option.id}
              onClick={() => onToggleOption(option.id)}
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                ${isSelected 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <Icon size={20} className={isSelected ? 'text-primary' : option.color} />
              <div>
                <p className="font-medium text-sm">{option.name}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
} 