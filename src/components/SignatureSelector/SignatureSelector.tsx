import { ChangeEvent } from 'react';
import { SignatureImage } from '../../types';
import './SignatureSelector.css';

interface SignatureSelectorProps {
  signatures: SignatureImage[];
  onAdd: (files: FileList) => void;
  onRemove: (id: string) => void;
}

const SignatureSelector = ({ signatures, onAdd, onRemove }: SignatureSelectorProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) onAdd(event.target.files);
    event.currentTarget.value = '';
  };

  return (
    <div className="signature-selector">
      <div className="signature-selector-heading">
        <div>
          <h2>Step 3: Select Signatures</h2>
          <p>Upload one or more signature images. They will be aligned across the certificate signature area.</p>
        </div>
        <label className="signature-upload-button">
          Add signature images
          <input type="file" accept="image/*" multiple onChange={handleChange} />
        </label>
      </div>
      {signatures.length === 0 ? <p className="signature-empty">No additional signatures selected.</p> : (
        <div className="signature-list">
          {signatures.map((signature) => (
            <div className="signature-item" key={signature.id}>
              <img src={signature.dataUrl} alt={signature.name} />
              <span title={signature.name}>{signature.name}</span>
              <button type="button" onClick={() => onRemove(signature.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SignatureSelector;
