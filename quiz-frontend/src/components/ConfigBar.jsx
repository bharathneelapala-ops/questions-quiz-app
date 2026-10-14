//import React from 'react';

export default function ConfigBar({ baseUrl, setBaseUrl }) {
  return (
    <div className="config-bar">
      <label htmlFor="baseUrlInput" className="config-label">
        Spring Boot URL:
      </label>
      <input
        id="baseUrlInput"
        type="text"
        className="config-input"
        value={baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
        placeholder="http://localhost:8082"
      />
      <span className="config-tag">Port 8082</span>
    </div>
  );
}
