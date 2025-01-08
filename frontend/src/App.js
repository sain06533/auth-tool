import React from 'react';
import Registration from './components/Registration';
import Login from './components/Login';

function App() {
  return (
    <div>
      <h1>Authentication API Client</h1>
      <Registration />
      <hr />
      <Login />
    </div>
  );
}

export default App;
