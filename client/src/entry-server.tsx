// src/entry-server.jsx
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export function render(url, context) {
  // You can use the URL to handle routing if needed
  const appHtml = renderToString(<App />);
  return appHtml;
}
