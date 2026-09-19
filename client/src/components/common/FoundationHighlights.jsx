export const FoundationHighlights = ({ title, items }) => {
  return (
    <div className="foundation-box">
      <h3>{title}</h3>
      <ul className="arch-list">
        {items.map((item, index) => (
          <li key={index}>
            <strong>{item.label}:</strong> {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
};
