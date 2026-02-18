import React from 'react';

export const FilterState = {
  status: undefined,
  minQuantity: undefined,
  maxQuantity: undefined,
  dateRange: undefined,
};

const SearchFilters = ({ onSearch, onFilter, onClear }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p>Search and filters will be implemented here</p>
    </div>
  );
};

export default SearchFilters;

