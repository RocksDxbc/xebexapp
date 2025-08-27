import React from 'react';

const InputField = ({ label, type = 'text', value, onChange, placeholder, required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition"
    />
  </div>
);

export default InputField;