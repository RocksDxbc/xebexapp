import React from 'react';

const ScreenLayout = ({ children }) => (
  <div className="flex-1 flex flex-col justify-center items-center py-20 px-4">
    {children}
  </div>
);

export default ScreenLayout;