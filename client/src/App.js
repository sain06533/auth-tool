// React frontend for multi-factor authentication
import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [points, setPoints] = useState([]);
  const [loginImage, setLoginImage] = useState(null);
  const [loginPreview, setLoginPreview] = useState(null);
  const [loginPoints, setLoginPoints] = useState([]);

  // Handle image selection during registration
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Handle image click during registration
  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width).toFixed(2);
    const y = ((e.clientY - rect.top) / rect.height).toFixed(2);
    setPoints([...points, { x, y }]);
  };

  // Handle image selection during login
  const handleLoginImageChange = (e) => {
    const file = e.target.files[0];
    setLoginImage(file);
    setLoginPreview(URL.createObjectURL(file));
  };

  // Handle image click during login
  const handleLoginImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width).toFixed(2);
    const y = ((e.clientY - rect.top) / rect.height).toFixed(2);
    setLoginPoints([...loginPoints, { x, y }]);
  };

  // Register user
  const register = async () => {
    if (!selectedImage || points.length === 0) {
      alert('Please select an image and define points.');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('image', selectedImage);
    formData.append('points', JSON.stringify(points));

    try {
      const response = await axios.post('http://localhost:5000/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(response.data.message);
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  // Login user
  const login = async () => {
    if (!loginImage || loginPoints.length === 0) {
      alert('Please select an image and define points for login.');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('image', loginImage);
    formData.append('points', JSON.stringify(loginPoints));

    try {
      const response = await axios.post('http://localhost:5000/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(response.data.message);
      setStep(3);
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      {step === 1 && (
        <div>
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <div style={{ position: 'relative' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '100%', marginTop: '10px' }}
                onClick={handleImageClick}
              />
              <div>
                {points.map((point, index) => (
                  <div key={index}>
                    Point {index + 1}: (x: {point.x}, y: {point.y})
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={register}>Register</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input type="file" accept="image/*" onChange={handleLoginImageChange} />
          {loginPreview && (
            <div style={{ position: 'relative' }}>
              <img
                src={loginPreview}
                alt="Preview"
                style={{ width: '100%', marginTop: '10px' }}
                onClick={handleLoginImageClick}
              />
              <div>
                {loginPoints.map((point, index) => (
                  <div key={index}>
                    Point {index + 1}: (x: {point.x}, y: {point.y})
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={login}>Login</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Login Successful</h2>
          <p>Welcome back, {username}!</p>
        </div>
      )}
    </div>
  );
};

export default App;
