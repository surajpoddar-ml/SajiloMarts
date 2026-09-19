export const StatusCard = ({
  statusIndicator,
  tag,
  title,
  detail,
  children,
}) => {
  return (
    <div className="status-card">
      <div className="card-header">
        <span className={`indicator ${statusIndicator}`}></span>
        <span className="card-tag">{tag}</span>
      </div>
      <h3 className="card-title">{title}</h3>
      <p className="card-detail">{detail}</p>
      {children}
    </div>
  );
};
