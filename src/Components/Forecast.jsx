import { useEffect, useState } from 'react';

function Forecast(props) {
    const coordinates = props.coordinates;
    const lat = coordinates.latitude;
    const lon = coordinates.longitude;
    const [forecast, setForecast] = useState(null);
    useEffect(() => {
        const getForecast = async () => {
            if(!lat || !lon)
                return;
            try {
                // send user message to backend
                const grid = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
                const gridData = await grid.json();
                const url = gridData.properties.forecast;
                const forecastRaw = await fetch(url);
                const forecastData = await forecastRaw.json();
                setForecast(forecastData);
            } catch (err) {
                console.log("Cannot connect to geolocation services", err);
            }
        }
        getForecast();
    }, [lat, lon]);
    if (!forecast) return <div>Loading forecast...</div>;
    return (
        <div>
            {forecast.properties.periods[0].detailedForecast}
        </div>
    )
}

export default Forecast;