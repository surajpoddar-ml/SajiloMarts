export const Header = ({ brandName, stepLabel }) => {
  return (
    <header className="header">
      <div className="logo-badge">
        <span className="logo-dot"></span>
        <span className="logo-text">{brandName}</span>
      </div>
      {stepLabel && <span className="step-pill">{stepLabel}</span>}
    </header>
  );
};
