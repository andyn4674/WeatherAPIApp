import { useGeolocated } from "react-geolocated";
import './App.css'
import Forecast from './Components/Forecast'

function App() {
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
          useGeolocated({
              positionOptions: {
                  enableHighAccuracy: false,
              },
              userDecisionTimeout: 5000,
          });
  if (!isGeolocationAvailable) return <div>Geolocation not supported</div>;
  if (!isGeolocationEnabled) return <div>Please enable location</div>;
  if (!coords) return <div>Getting coordinates...</div>;
  return (
    <>
      <Forecast coordinates={coords} />
    </>
  )
}

export default App;
