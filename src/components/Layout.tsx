import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <div className="pt-20"> {/* Account for fixed header */}
        {children}
      </div>
    </div>
  );
};

export default Layout;
