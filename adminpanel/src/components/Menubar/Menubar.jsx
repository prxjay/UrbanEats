import React from 'react';

const Menubar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
        <div className="container-fluid">
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--secondary)' }}>Admin Dashboard</span>
        </div>
    </nav>
  )
}

export default Menubar;