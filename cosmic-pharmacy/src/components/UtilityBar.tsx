import { business } from '../data/business';

export function UtilityBar() {
  return (
    <div className="utility-bar">
      <div className="wrap utility-inner">
        <span className="utility-item">{business.hoursShort}</span>
        <a className="utility-item utility-link" href={`tel:${business.phoneTel}`}>
          {business.phoneDisplay} · WhatsApp
        </a>
        <span className="utility-item utility-address">{business.address}</span>
      </div>
    </div>
  );
}
