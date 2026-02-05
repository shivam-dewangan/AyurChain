import React from 'react';

export interface FilterState {
  status?: string;
  minQuantity?: number;
  maxQuantity?: number;
  dateRange?: string;
}

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterState) => void;
  onClear: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, onFilter, onClear }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p>Search and filters will be implemented here</p>
    </div>
  );
};

export default SearchFilters;