export const Footer = ({ brandName }) => {
  return (
    <footer className="footer">
      <p>{brandName} Foundation &copy; {new Date().getFullYear()} &bull; Ready for next development phases</p>
    </footer>
  );
};
