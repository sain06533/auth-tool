import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [points, setPoints] = useState([]);
  const [message, setMessage] = useState('');

  // Step 1: Validate Username & Password
  const handleLoginStep1 = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/getImages/${username}`);
      setImages(response.data); // Store the full image objects
      setStep(2);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed.");
    }
  };

  // Step 2: Handle Image Selection
  const handleImageSelect = async (img) => {
    // Store the entire image object instead of just the filename
    setSelectedImage(img);
    try {
      // Send only the filename to your API if that's what is expected
      const response = await axios.post('http://localhost:5000/api/auth/login-step2', { username, selectedImage: img.filename });
      if (response.data.message === 'Correct image selected, proceed to point verification') {
        setStep(3);
      } else {
        setMessage('Incorrect image selected.');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Image selection failed.');
    }
  };

  // Step 3: Handle Point Selection
  const handleCanvasClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setPoints([...points, { x, y }]);
  };

  // Step 3: Verify Points
  const handleLoginStep3 = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login-step3', {
        username,
        points: JSON.stringify(points),
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Point verification failed.');
    }
  };

  return (
    <div>
      <h2>Login</h2>

      {/* Step 1: Username & Password */}
      {step === 1 && (
        <form onSubmit={handleLoginStep1}>
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
          <button type="submit">Next</button>
        </form>
      )}

      {/* Step 2: Image Selection */}
      {step === 2 && (
        <div>
          <h3>Select the correct image</h3>
          {images.map((img, index) => (
            <img
              key={index}
              src={img.data} // Assuming img.data is a valid Base64 URL
              alt={`Option ${index + 1}`}
              onClick={() => handleImageSelect(img)}
              style={{
                width: "100px",
                height: "100px",
                margin: "5px",
                cursor: "pointer",
                border: selectedImage && selectedImage.filename === img.filename ? "3px solid blue" : "1px solid gray",
              }}
            />
          ))}
        </div>
      )}

      {/* Step 3: Select Points on Image */}
      {/* Step 3: Select Points on Image */}
{step === 3 && selectedImage && (
  <div>
    <h4>Click on 3 points on the selected image</h4>
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <img
        src={selectedImage.data} // Ensure the correct base64 data
        alt="Selected"
        style={{ width: '300px', cursor: 'crosshair' }}
        onClick={handleCanvasClick}
      />
      {points.map((point, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: `${point.y}px`,
            left: `${point.x}px`,
            width: '6px',
            height: '6px',
            backgroundColor: 'red',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
    <button onClick={handleLoginStep3}>Verify Points</button>
  </div>
)}


      <p>{message}</p>
    </div>
  );
};

export default Login;
