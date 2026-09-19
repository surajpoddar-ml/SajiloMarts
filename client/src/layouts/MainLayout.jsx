export const MainLayout = ({ children, header, footer }) => {
  return (
    <div className="app-layout">
      {header && <header className="app-header">{header}</header>}
      <main className="app-main">{children}</main>
      {footer && <footer className="app-footer">{footer}</footer>}
    </div>
  );
};
