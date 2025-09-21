// src/App.js
import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Use API key from .env
  const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

  useEffect(() => {
    (async () => {
      try {
        // Check if browser supports geolocation
        if (!navigator.geolocation) {
          setErrorMsg("Geolocation is not supported by your browser");
          setLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const coords = position.coords;
            setLocation(coords);

            // Fetch weather data
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${API_KEY}&units=metric`
            );
            const data = await response.json();

            // Add city name
            const cityName = data.name || "Your Location";
            setWeather({ ...data, city: cityName });
            setLoading(false);
          },
          (error) => {
            setErrorMsg("Failed to get your location");
            setLoading(false);
          }
        );
      } catch (err) {
        setErrorMsg("Failed to fetch weather data");
        setLoading(false);
      }
    })();
  }, [API_KEY]);

  // Dynamic background color based on weather
  const getBackgroundColor = () => {
    if (!weather) return "#f0f8ff";

    const condition = weather.weather?.[0]?.main?.toLowerCase();
    const now = Math.floor(Date.now() / 1000);
    const sunrise = weather.sys?.sunrise || 0;
    const sunset = weather.sys?.sunset || 0;
    const isDay = now >= sunrise && now <= sunset;

    if (condition === "clear") return isDay ? "#FFD700" : "#2c3e50";
    if (condition === "rain" || condition === "drizzle")
      return isDay ? "#87CEFA" : "#34495e";
    if (condition === "clouds") return isDay ? "#D3D3D3" : "#7f8c8d";
    if (condition === "snow") return "#ADD8E6";
    return "#f0f8ff";
  };

  // Farming suggestion
  const getFarmingSuggestion = () => {
    if (!weather) return "";

    const condition = weather.weather?.[0]?.main?.toLowerCase();
    const temp = weather.main?.temp;

    if (temp > 35)
      return "🔥 High temperature: Ensure irrigation and provide shade for sensitive crops.";
    if (temp < 10) return "❄ Cold weather: Protect crops from frost.";

    if (condition === "clear") return "🌞 Good day for planting or harvesting crops.";
    if (condition === "rain" || condition === "drizzle")
      return "🌧 Protect crops from excess water and prepare drainage.";
    if (condition === "clouds") return "☁ Check soil moisture before irrigation.";

    return "🌱 Monitor your crops regularly for best results.";
  };

  if (loading) {
    return (
      <div className="container">
        <p>Fetching weather data...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="container">
        <p className="error">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ backgroundColor: getBackgroundColor(), minHeight: "100vh" }}
    >
      {weather && location ? (
        <div className="card">
          <h1>{weather.city}</h1>
          <p>
            📍 Lat: {location.latitude.toFixed(2)}, Lon:{" "}
            {location.longitude.toFixed(2)}
          </p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
            alt="weather icon"
          />
          <h2>🌡 {weather.main.temp}°C</h2>
          <h3>{weather.weather[0].main}</h3>
          <p>{weather.weather[0].description}</p>
          <p className="suggestion">{getFarmingSuggestion()}</p>
        </div>
      ) : (
        <p>No weather data available</p>
      )}
    </div>
  );
}
