import { Template, TemplateContent } from '../../types';
import './ContentSelector.css';

interface ContentSelectorProps {
  selectedTemplate: Template | null;
  templates: Template[];
  selectedContent: TemplateContent | null;
  selectedContentId: string | null;
  onSelectContent: (contentId: string, content: TemplateContent, sourceTemplateId: string) => void;
  onEnterManualContent: (bodyTemplate: string) => void;
}

function ContentSelector({
  selectedTemplate,
  templates,
  selectedContent,
  selectedContentId,
  onSelectContent,
  onEnterManualContent
}: ContentSelectorProps) {
  if (!selectedTemplate) {
    return (
      <div className="content-selector-container disabled">
        <h2>Step 2: Select Body Template</h2>
        <p className="placeholder-text">Please select a template first</p>
      </div>
    );
  }

  const contentEntries = templates.flatMap((template) =>
    Object.entries(template.contents).map(([contentId, content]) => ({
      contentId,
      content,
      sourceTemplateId: template.id,
      key: `${template.id}:${contentId}`
    }))
  );

  return (
    <div className="content-selector-container">
      <h2>Step 2: Select Body Template</h2>
      <div className="content-grid">
        {contentEntries.map(({ contentId, content, sourceTemplateId, key }) => (
          <div
            key={key}
            className={`content-card ${selectedContentId === key ? 'selected' : ''}`}
            onClick={() => onSelectContent(key, content, sourceTemplateId)}
          >
            <div className="content-title">
              {content.description} ({templates.find((template) => template.id === sourceTemplateId)?.name})
            </div>
            <div className="content-preview">
              <strong>Body template:</strong>
              <p className="body-template-preview">{content.bodyTemplate || 'Default certificate body'}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={`manual-content-card ${selectedContentId === 'custom' ? 'selected' : ''}`}>
        <h3>Enter Custom Body Content</h3>
        <p>Variables: {'{name}'}, {'{course}'}, {'{startDate}'}, {'{endDate}'}, {'{durationMonths}'}</p>
        <textarea
          className="manual-content-input"
          placeholder="Enter your certificate body content here..."
          onChange={(event) => onEnterManualContent(event.target.value)}
        />
      </div>
    </div>
  );
}

export default ContentSelector;
