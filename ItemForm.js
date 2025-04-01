import React, { useState, useRef } from "react"; // Added useRef
import axios from "axios";
import "./ItemForm.css";

const API_BASE_URL = "http://localhost:8080/api/items";

const ItemForm = ({ onItemAdded }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [items, setItems] = useState([]);
  
  // Create a ref for the file input
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !price || !file) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", parseFloat(price));
    formData.append("image", file);

    try {
      const response = await axios.post(`${API_BASE_URL}/save`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onItemAdded(response.data);
      
      // Reset all form fields
      setName("");
      setDescription("");
      setPrice("");
      setFile(null);
      setImagePreview(null);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh items list
      const itemsResponse = await axios.get(`${API_BASE_URL}/all`);
      setItems(itemsResponse.data);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="item-form">
        <h2>Add a New Item</h2>

        <input
          type="text"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-input"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="form-input"
          required
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="form-input"
          required
          ref={fileInputRef} // Add the ref here
        />

        {imagePreview && (
          <div className="image-preview-container">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="image-preview"
            />
          </div>
        )}

        <button type="submit" className="submit-button">
          Add Item
        </button>
      </form>

      <div className="items-list">
        <h3>Items List:</h3>
        {items.map((item) => (
          <div key={item.id} className="item">
            {item.imagePath && (
              <img 
                src={item.imagePath}
                alt={item.name} 
                className="item-image"
                onError={(e) => {
                  e.target.src = "/placeholder.jpg";
                  e.target.alt = "Image not available";
                }}
              />
            )}
            <div className="item-details">
              <h4>{item.name}</h4>
              <p>{item.description}</p>
              <p>Price: ${item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemForm;