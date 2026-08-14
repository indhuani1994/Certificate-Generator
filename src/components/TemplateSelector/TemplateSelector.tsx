import { Template } from '../../types';
import './TemplateSelector.css';

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onSelectTemplate: (template: Template) => void;
  onUploadTemplate: (file: File) => void;
}

function TemplateSelector({ templates, selectedTemplate, onSelectTemplate, onUploadTemplate }: TemplateSelectorProps) {
  return (
    <div className="template-selector-container">
      <h2>Step 1: Select Certificate Template</h2>
      <div className="template-grid">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
            onClick={() => onSelectTemplate(template)}
          >
            <img
              src={template.imagePath}
              alt={template.name}
              className="template-preview"
            />
            <div className="template-name">{template.name}</div>
          </div>
        ))}
        <label className="template-upload-card">
          <div className="template-upload-icon">+</div>
          <div className="template-name">Upload Your Template Image</div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUploadTemplate(file);
              event.currentTarget.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
}

export default TemplateSelector;
