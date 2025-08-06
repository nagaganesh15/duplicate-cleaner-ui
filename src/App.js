import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [folderPath, setFolderPath] = useState('');
  const [duplicates, setDuplicates] = useState({});
  const [selectedToDelete, setSelectedToDelete] = useState({});
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!folderPath.trim()) {
      alert("📁 Please enter a folder path.");
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/set-folder', { folder: folderPath });
      const res = await axios.get('http://localhost:5000/scan');
      setDuplicates(res.data || {});
      setSelectedToDelete({});
    } catch {
      alert("❌ Error during scan.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorize = async () => {
    if (!folderPath.trim()) {
      alert("📁 Please enter a folder path before categorizing.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/set-folder', { folder: folderPath });
      await axios.get('http://localhost:5000/categorize');
      alert("📂 Files categorized successfully.");
    } catch {
      alert("❌ Error during categorization.");
    }
  };

  const toggleCheckbox = (hash, path) => {
    setSelectedToDelete(prev => {
      const updated = { ...prev };
      const currentGroup = updated[hash] || [];

      if (currentGroup.includes(path)) {
        updated[hash] = currentGroup.filter(p => p !== path);
      } else {
        updated[hash] = [...currentGroup, path];
      }

      return updated;
    });
  };

  const handleDeleteSelected = async () => {
    const allSelectedPaths = Object.values(selectedToDelete).flat();

    if (allSelectedPaths.length === 0) {
      alert("❗ Please select at least one file to delete.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/delete', { paths: allSelectedPaths });
      alert("🗑️ Selected files deleted.");
      handleScan();
    } catch {
      alert("❌ Failed to delete files.");
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>🔍 Duplicate App Cleaner</h1>

        <div className="input-section">
          <input
            type="text"
            placeholder="Enter folder path"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
          />
        </div>

        <div className="button-group">
          <button onClick={handleScan}>Scan Folder</button>
          <button onClick={handleCategorize}>Categorize</button>
        </div>

        {loading && <p className="loading">🔄 Scanning... Please wait.</p>}

        {Object.keys(duplicates).length > 0 && (
          <div className="duplicates-section">
            <h2>🔁 Duplicates Found</h2>
            {Object.entries(duplicates).map(([hash, paths], groupIndex) => (
              <div className="duplicate-group" key={groupIndex}>
                <h3>Group {groupIndex + 1}</h3>
                {paths.map((path, idx) => (
                  <div className="file-entry" key={idx}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedToDelete[hash]?.includes(path) || false}
                        onChange={() => toggleCheckbox(hash, path)}
                      />
                      {path}
                    </label>
                  </div>
                ))}
              </div>
            ))}

            <div className="delete-btn-wrapper">
              <button
                className="delete-button global-delete-button"
                onClick={handleDeleteSelected}
              >
                🗑️ Delete Selected Files
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
