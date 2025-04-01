import React, { useState, useEffect } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import ItemForm from "./ItemForm";
import SearchBar from "./SearchBar";
import "./App.css";

const API_BASE_URL = "http://localhost:8080/api/items";

const App = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verify if image exists at URL
  const checkImageExists = async (url) => {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchItems(0, query);
  }, [query]);

  const fetchItems = async (pageNumber, searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: { 
          query: searchQuery,
          page: pageNumber,
          size: 10
        },
      });

      // Verify images exist before setting state
      const itemsWithImageStatus = await Promise.all(
        response.data.content.map(async item => {
          const imageExists = item.imagePath ? await checkImageExists(item.imagePath) : false;
          return { ...item, imageExists };
        })
      );

      if (itemsWithImageStatus.length === 0) {
        setHasMore(false);
      } else {
        setItems(prevItems =>
          pageNumber === 0 
            ? itemsWithImageStatus 
            : [...prevItems, ...itemsWithImageStatus]
        );
        setPage(pageNumber + 1);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    setPage(0);
    setHasMore(true);
    setItems([]);
  };

  const handleItemAdded = (newItem) => {
    // Verify the image exists for the new item
    checkImageExists(newItem.imagePath).then(exists => {
      setItems(prevItems => [{ ...newItem, imageExists: exists }, ...prevItems]);
    });
  };

  return (
    <div className="app-container">
      <ItemForm onItemAdded={handleItemAdded} />
      <SearchBar onSearch={handleSearch} />
      
      {error && <div className="error-message">{error}</div>}
      {loading && page === 0 && <div className="loading">Loading initial items...</div>}

      <InfiniteScroll
        dataLength={items.length}
        next={() => fetchItems(page, query)}
        hasMore={hasMore}
        loader={<div className="loading">Loading more items...</div>}
        endMessage={
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            {items.length > 0 ? "You've seen all items" : "No items found"}
          </p>
        }
      >
        <div className="items-grid">
          {items.map(item => (
            <div key={item.id} className="item-card">
              <h3>{item.name}</h3>
              <p className="description">{item.description}</p>
              <p className="price">Price: ${item.price.toFixed(2)}</p>
              
              {/* Debug information - visible in development only */}
              {process.env.NODE_ENV === 'development' && (
                <div className="debug-info">
                  <p><strong>Image URL:</strong> {item.imagePath || 'N/A'}</p>
                  <p><strong>Status:</strong> {item.imageExists ? 'Exists' : 'Missing'}</p>
                </div>
              )}

              {/* Image display */}
              {item.imagePath && item.imageExists ? (
                <div className="image-container">
                  <img 
                    src={item.imagePath}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                      // Update state to mark image as missing
                      setItems(prev => prev.map(i => 
                        i.id === item.id ? { ...i, imageExists: false } : i
                      ));
                    }}
                  />
                </div>
              ) : (
                <div className="no-image">
                  <p>No image available</p>
                  {item.imagePath && !item.imageExists && (
                    <p className="image-error">(Image file missing on server)</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default App;