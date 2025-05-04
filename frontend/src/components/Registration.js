import React, { useState } from 'react';
import axios from 'axios';
import './Registration.css';

const Registration = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [points, setPoints] = useState([]);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length !== 4) {
      setMessage('Please upload exactly 4 images.');
      return;
    }
    setImages(files);
    setShowModal(true); // Show image selection modal
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setPoints([]); // Reset points when changing image
    setShowModal(false); // Hide modal
  };

  const handleCanvasClick = (event) => {
    if (!selectedImage) return;

    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setPoints([...points, { x, y }]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!selectedImage || points.length === 0) {
      setMessage('Please select an image and define points.');
      return;
    }
  
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
  
    images.forEach((image) => {
      formData.append('images', image); // Keep the original filename
    });
  
    formData.append('selectedImage', selectedImage.name); // Keep original name
    formData.append('points', JSON.stringify(points));
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed.');
    }
  };
  

  return (
    <div className="registration-container">
      <h2>Register</h2>
      <form className="registration-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <div className="file-upload">
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleImageUpload} 
            required 
          />
        </div>

        {selectedImage && (
          <div className="image-preview">
            <h4>Click on points in the selected image</h4>
            <div className="preview-container">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                onClick={handleCanvasClick}
              />
              {points.map((point, index) => (
                <div
                  key={index}
                  className="point-marker"
                  style={{
                    left: `${point.x}px`,
                    top: `${point.y}px`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <button type="submit">Register</button>
      </form>

      {/* Image Selection Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Select an Image</h3>
            <div className="image-grid">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(img)}
                  alt={`Option ${index + 1}`}
                  onClick={() => handleImageSelect(img)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {message && <p className={`message ${message.includes('failed') ? 'error' : 'success'}`}>{message}</p>}
    </div>
  );
};

export default Registration;
