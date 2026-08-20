import { CertificateLayout } from '../../types';
import './LayoutControls.css';

interface LayoutControlsProps {
  layout: CertificateLayout;
  onChange: (layout: CertificateLayout) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function LayoutControls({ layout, onChange }: LayoutControlsProps) {
  const update = (section: 'heading' | 'content' | 'signature', values: Record<string, string | number>) => {
    onChange({ ...layout, [section]: { ...layout[section], ...values } });
  };

  const move = (section: 'heading' | 'content' | 'signature', amount: number) => {
    const current = layout[section];
    update(section, { left: clamp(current.left + amount, 3, 97) });
  };

  return (
    <div className="layout-controls">
      <h2>Certificate Layout</h2>
      <p className="layout-help">Set the text and image positions before generating certificates.</p>

      <div className="layout-section">
        <h3>Heading</h3>
        <input className="layout-text-input" value={layout.heading.text} onChange={(e) => update('heading', { text: e.target.value })} placeholder="Enter certificate heading" />
        <div className="control-grid">
          <label>Font style<select value={layout.heading.fontFamily} onChange={(e) => update('heading', { fontFamily: e.target.value })}>
            <option value="Georgia">Georgia</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
          </select></label>
          <label>Size: {layout.heading.fontSize}px<input type="range" min="16" max="100" value={layout.heading.fontSize} onChange={(e) => update('heading', { fontSize: Number(e.target.value) })} /></label>
          <label>Colour<input type="color" value={layout.heading.color} onChange={(e) => update('heading', { color: e.target.value })} /></label>
          <label>Vertical position: {layout.heading.top}%<input type="range" min="5" max="80" value={layout.heading.top} onChange={(e) => update('heading', { top: Number(e.target.value) })} /></label>
        </div>
        <div className="position-controls"><span>Horizontal position: {layout.heading.left}%</span><button type="button" onClick={() => move('heading', -1)}>← Left</button><button type="button" onClick={() => move('heading', 1)}>Right →</button></div>
      </div>

      <div className="layout-section">
        <h3>Content</h3>
        <div className="control-grid">
          <label>Font size: {layout.content.fontSize}px<input type="range" min="12" max="48" value={layout.content.fontSize} onChange={(e) => update('content', { fontSize: Number(e.target.value) })} /></label>
          <label>Vertical position: {layout.content.top}%<input type="range" min="25" max="70" value={layout.content.top} onChange={(e) => update('content', { top: Number(e.target.value) })} /></label>
        </div>
        <div className="position-controls"><span>Horizontal position: {layout.content.left}%</span><button type="button" onClick={() => move('content', -1)}>← Left</button><button type="button" onClick={() => move('content', 1)}>Right →</button></div>
      </div>

      <div className="layout-section">
        <h3>Signature</h3>
        <div className="control-grid">
          <label>Size: {layout.signature.size}%<input type="range" min="5" max="35" value={layout.signature.size} onChange={(e) => update('signature', { size: Number(e.target.value) })} /></label>
          <label>Vertical position: {layout.signature.top}%<input type="range" min="55" max="90" value={layout.signature.top} onChange={(e) => update('signature', { top: Number(e.target.value) })} /></label>
        </div>
        <div className="position-controls"><span>Horizontal position: {layout.signature.left}%</span><button type="button" onClick={() => move('signature', -1)}>← Left</button><button type="button" onClick={() => move('signature', 1)}>Right →</button></div>
      </div>
    </div>
  );
}

export default LayoutControls;
