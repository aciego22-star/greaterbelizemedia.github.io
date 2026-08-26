interface QuantityControlProps {
  value: number;
  onChange: (next: number) => void;
  label: string;
}

export function QuantityControl({ value, onChange, label }: QuantityControlProps) {
  return (
    <div className="qty" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" className="qty-btn" aria-label={`Decrease quantity of ${label}`} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className="qty-value num" aria-live="polite">
        {value}
      </span>
      <button type="button" className="qty-btn" aria-label={`Increase quantity of ${label}`} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
