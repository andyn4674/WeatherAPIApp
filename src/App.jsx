import { useState } from "react";
import { useGeolocated } from "react-geolocated";
import './App.css'
import Forecast from './Components/Forecast'

function App() {
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [manualCoords, setManualCoords] = useState(null);
  const [geocodeError, setGeocodeError] = useState(null);
  const [isLoadingGeocode, setIsLoadingGeocode] = useState(false);

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
    });

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;
    
    setIsLoadingGeocode(true);
    setGeocodeError(null);
    
    try {
      // Use OpenStreetMap's Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length === 0) {
        setGeocodeError("Location not found. Please try a different search.");
        setManualCoords(null);
      } else {
        setManualCoords({
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          locationName: data[0].display_name
        });
        setGeocodeError(null);
      }
    } catch (err) {
      setGeocodeError("Error finding location. Please try again.");
      console.error("Geocoding error:", err);
    } finally {
      setIsLoadingGeocode(false);
    }
  };

  const handleToggleMode = () => {
    setUseManualLocation(!useManualLocation);
    setGeocodeError(null);
    setManualCoords(null);
    setLocationInput("");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🌤️ Weather Forecast</h1>
        <p className="app-subtitle">Get current weather conditions and forecasts</p>
      </header>

      <div className="location-controls">
        <div className="toggle-container">
          <button 
            className={`toggle-btn ${!useManualLocation ? 'active' : ''}`}
            onClick={handleToggleMode}
          >
            📍 Use My Location
          </button>
          <button 
            className={`toggle-btn ${useManualLocation ? 'active' : ''}`}
            onClick={handleToggleMode}
          >
            🔍 Search Location
          </button>
        </div>

        {useManualLocation && (
          <form onSubmit={handleLocationSubmit} className="location-form">
            <div className="input-group">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter city, state, or address..."
                className="location-input"
              />
              <button 
                type="submit" 
                className="search-btn"
                disabled={isLoadingGeocode || !locationInput.trim()}
              >
                {isLoadingGeocode ? "Searching..." : "Search"}
              </button>
            </div>
            {geocodeError && <div className="error-message">{geocodeError}</div>}
            {manualCoords && (
              <div className="location-info">
                📍 {manualCoords.locationName}
              </div>
            )}
          </form>
        )}
      </div>

      <main className="forecast-container">
        {!useManualLocation ? (
          // Geolocation mode
          !isGeolocationAvailable ? (
            <div className="status-message error">Geolocation is not supported by your browser</div>
          ) : !isGeolocationEnabled ? (
            <div className="status-message warning">Please enable location access to use this feature</div>
          ) : !coords ? (
            <div className="status-message">Getting your location...</div>
          ) : (
            <Forecast coordinates={coords} />
          )
        ) : (
          // Manual location mode
          !manualCoords ? (
            <div className="status-message">Enter a location to view the forecast</div>
          ) : (
            <Forecast coordinates={manualCoords} locationName={manualCoords.locationName} />
          )
        )}
      </main>
    </div>
  );
}

export default App;
