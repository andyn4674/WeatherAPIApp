import { useEffect, useState } from 'react';
import './Forecast.css';

function Forecast(props) {
    const coordinates = props.coordinates;
    const lat = coordinates.latitude;
    const lon = coordinates.longitude;
    const locationName = props.locationName;
    const [forecast, setForecast] = useState(null);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const getForecast = async () => {
            if(!lat || !lon)
                return;
            try {
                setError(null);
                // send user message to backend
                const grid = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
                const gridData = await grid.json();
                
                if (gridData.status === 404 || !gridData.properties) {
                    setError("Weather data is not available for this location. The National Weather Service only provides data for US locations.");
                    setForecast(null);
                    return;
                }
                
                const url = gridData.properties.forecast;
                const forecastRaw = await fetch(url);
                const forecastData = await forecastRaw.json();
                setForecast(forecastData);
            } catch (err) {
                console.log("Cannot connect to geolocation services", err);
                setError("Unable to fetch weather data. This service only works for US locations.");
                setForecast(null);
            }
        }
        getForecast();
    }, [lat, lon]);
    
    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <div className="error-text">{error}</div>
            </div>
        );
    }
    
    if (!forecast) return <div className="loading">Loading forecast...</div>;
    
    const currentPeriod = forecast.properties.periods[0];
    const upcomingPeriods = forecast.properties.periods.slice(1, 7);
    
    return (
        <div className="forecast-wrapper">
            {locationName && (
                <div className="current-location">
                    <h2>Weather for {locationName.split(',')[0]}</h2>
                </div>
            )}
            
            <div className="current-forecast">
                <div className="current-header">
                    <h2>{currentPeriod.name}</h2>
                    <div className="temperature">{currentPeriod.temperature}°{currentPeriod.temperatureUnit}</div>
                </div>
                <div className="current-icon">
                    <img src={currentPeriod.icon} alt={currentPeriod.shortForecast} />
                </div>
                <div className="current-summary">
                    <h3>{currentPeriod.shortForecast}</h3>
                    <p>{currentPeriod.detailedForecast}</p>
                </div>
                <div className="wind-info">
                    <span className="wind-label">💨 Wind:</span> {currentPeriod.windSpeed} {currentPeriod.windDirection}
                </div>
            </div>

            <div className="upcoming-forecast">
                <h3 className="upcoming-title">Upcoming Forecast</h3>
                <div className="forecast-grid">
                    {upcomingPeriods.map((period, index) => (
                        <div key={index} className="forecast-card">
                            <div className="period-name">{period.name}</div>
                            <img src={period.icon} alt={period.shortForecast} className="period-icon" />
                            <div className="period-temp">{period.temperature}°{period.temperatureUnit}</div>
                            <div className="period-summary">{period.shortForecast}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Forecast;
