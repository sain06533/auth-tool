import React, { useState } from 'react';
import axios from 'axios';

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
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} required />

        {selectedImage && (
          <div>
            <h4>Click on points in the selected image</h4>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                style={{ width: '300px', cursor: 'crosshair' }}
                onClick={handleCanvasClick}
              />
              {points.map((point, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: `${point.x}px`,
                    top: `${point.y}px`,
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}

        <button type="submit">Register</button>
      </form>
      <p>{message}</p>

      {/* Image Selection Modal */}
      {showModal && (
        <div className="modal">
          <h3>Select an Image</h3>
          <div className="modal-content">
            {images.map((img, index) => (
              <img
                key={index}
                src={URL.createObjectURL(img)}
                alt={`Option ${index + 1}`}
                style={{ width: '100px', margin: '10px', cursor: 'pointer' }}
                onClick={() => handleImageSelect(img)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;
