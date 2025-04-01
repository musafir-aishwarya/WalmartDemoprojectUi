import React, { useState } from "react";
import "./SearchBar.css"; // Import the CSS file for styling

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery); // Use onSearch here, not onSearchResults
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search items..."
        value={query}
        onChange={handleChange}
        className="search-bar"
      />
    </div>
  );
};

export default SearchBar;
