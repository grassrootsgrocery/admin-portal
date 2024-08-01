import React, { useState } from 'react';
import "./SearchButton.css";

interface SearchButtonProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchButton: React.FC<SearchButtonProps> = ({ value, onChange }) => {
  return (
    <div className="searchButton">
      <label>Search</label>
      <input
        placeholder="Type to search..."
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)} // Update onChange to use the passed prop
      />
    </div>
  );
};

