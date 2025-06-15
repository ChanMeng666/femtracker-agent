import React from 'react';

interface InstructionsSectionProps {
  instructions: string[];
  changedKeys: string[];
  editingIndex: number | null;
  onAddInstruction: () => void;
  onUpdateInstruction: (index: number, value: string) => void;
  onRemoveInstruction: (index: number) => void;
  onSetEditingIndex: (index: number | null) => void;
}

export const InstructionsSection: React.FC<InstructionsSectionProps> = ({
  instructions,
  changedKeys,
  editingIndex,
  onAddInstruction,
  onUpdateInstruction,
  onRemoveInstruction,
  onSetEditingIndex,
}) => {
  return (
    <div className="section-container relative">
      {changedKeys.includes("instructions") && <Ping />}
      <div className="section-header">
        <h2 className="section-title">Instructions</h2>
        <button 
          type="button" 
          className="add-step-button"
          onClick={onAddInstruction}
        >
          + Add Step
        </button>
      </div>
      <div className="instructions-container">
        {instructions.map((instruction, index) => (
          <div key={index} className="instruction-item">
            <div className="instruction-number">
              {index + 1}
            </div>
            
            {index < instructions.length - 1 && (
              <div className="instruction-line" />
            )}
            
            <div 
              className={`instruction-content ${
                editingIndex === index 
                  ? 'instruction-content-editing' 
                  : 'instruction-content-default'
              }`}
              onClick={() => onSetEditingIndex(index)}
            >
              <textarea
                className="instruction-textarea"
                value={instruction || ''}
                onChange={(e) => onUpdateInstruction(index, e.target.value)}
                placeholder={!instruction ? "Enter cooking instruction..." : ""}
                onFocus={() => onSetEditingIndex(index)}
                onBlur={(e) => {
                  if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
                    onSetEditingIndex(null);
                  }
                }}
              />
              
              <button 
                type="button"
                className={`instruction-delete-btn ${
                  editingIndex === index 
                    ? 'instruction-delete-btn-editing' 
                    : 'instruction-delete-btn-default'
                } remove-button`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveInstruction(index);
                }}
                aria-label="Remove instruction"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function Ping() {
  return (
    <span className="ping-animation">
      <span className="ping-circle"></span>
      <span className="ping-dot"></span>
    </span>
  );
} 