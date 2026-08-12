interface ResetButtonProps {
  onReset: () => void;
}

const ResetButton = ({ onReset }: ResetButtonProps) => (
  <button type="button" className="reset-button" onClick={onReset}>
    Reset / Start Over
  </button>
);

export default ResetButton;
