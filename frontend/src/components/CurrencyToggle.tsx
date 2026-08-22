import type { ReferenceCurrency } from '../lib/types';

interface CurrencyToggleProps {
  value: ReferenceCurrency;
  onChange: (currency: ReferenceCurrency) => void;
}

export default function CurrencyToggle({ value, onChange }: CurrencyToggleProps) {
  return (
    <div className="toggle-group">
      <button
        className={`toggle-option ${value === 'BRL' ? 'active' : ''}`}
        onClick={() => onChange('BRL')}
      >
        🇧🇷 BRL (R$)
      </button>
      <button
        className={`toggle-option ${value === 'USD' ? 'active' : ''}`}
        onClick={() => onChange('USD')}
      >
        🇺🇸 USD ($)
      </button>
    </div>
  );
}
