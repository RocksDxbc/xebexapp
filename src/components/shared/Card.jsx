import React from 'react';

const Card = ({ children, title }) => (
  <div className="bg-lime-500 pink:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
    <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
    {children}
  </div>
);

export default Card;