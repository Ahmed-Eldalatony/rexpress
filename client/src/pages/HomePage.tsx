
// src/pages/HomePage.jsx
import React, { useState } from 'react';

export default function HomePage() {
  const [count, setCount] = useState(0);
  return (
<div style={{ padding: '2rem' }}>
      <h1>Hello, React + Express + TypeScript!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
