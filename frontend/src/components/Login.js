import React, { useState, useRef } from 'react';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const [points, setPoints] = useState([]);
  const [usbDevice, setUsbDevice] = useState(null);
  const [message, setMessage] = useState('');
  const canvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImage(file);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setPoints([...points, { x, y }]);

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
  };

  const selectUsbDevice = async () => {
    try {
      const device = await navigator.usb.requestDevice({ filters: [] });
      setUsbDevice({
        vendorId: device.vendorId,
        productId: device.productId,
        serialNumber: device.serialNumber || 'N/A',
      });
      setMessage(`USB Device Selected: Vendor ID ${device.vendorId}, Product ID ${device.productId}`);
    } catch (error) {
      console.error('Error selecting USB device:', error);
      setMessage('Failed to select USB device.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!image || points.length === 0) {
      setMessage('Please upload an image and select points.');
      return;
    }

    if (!usbDevice) {
      setMessage('Please select a USB device.');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('image', image);
    formData.append('points', JSON.stringify(points));
    formData.append('usbDevice', JSON.stringify(usbDevice));

    try {
      console.log('USB Device Data:', usbDevice);
      const response = await axios.post('https://auth-tool.onrender.com/api/auth/login', formData);
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
        <input type="file" accept="image/*" onChange={handleImageUpload} required />
        <canvas
          ref={canvasRef}
          style={{ border: '1px solid black', display: image ? 'block' : 'none' }}
          onClick={handleCanvasClick}
        ></canvas>
        <button type="button" onClick={selectUsbDevice}>
          Select USB Device
        </button>
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Login;
