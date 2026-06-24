const input = document.getElementById('city-input');
const button = document.getElementById('search-button');
const errorMsg = document.getElementById('error-msg');

button.addEventListener('click', searchWeather);

input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') searchWeather();
});

async function searchWeather() {
    const city = input.value.trim();

    if (!city) return;

    errorMsg.textContent = '';

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            errorMsg.textContent = `City "${city}" not found.  Try again.`;
            return;
        }

            const { latitude, longitude, name, country } = geoData.results[0];
            
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
            const weatherRes = await fetch(weatherUrl);
            const weatherData = await weatherRes.json();

            renderWeather(name, country, weatherData);
    } catch (err) {
        errorMsg.textContent = 'Something went wrong. Check your connection';
        console.error(err);
    }
};

function renderWeather(name, country, data) {
    const c = data.current;

    document.getElementById('city-name').textContent = `${name}, ${country}`;
    document.getElementById('date').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('temperature').textContent = `${Math.round(c.temperature_2m)}°C`;
    document.getElementById('weather-icon').textContent = getIcon(c.weather_code);
    document.getElementById('condition').textContent = getCondition(c.weather_code);
    document.getElementById('humidity').textContent = `${c.relative_humidity_2m}%`;
    document.getElementById('wind').textContent = `${Math.round(c.wind_speed_10m)}km/h`;
    document.getElementById('feels-like').textContent = `${Math.round(c.apparent_temperature)}°C`;

    document.getElementById('weather-card').style.display = 'block';
}

function getIcon(code) {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 55) return '🌦️';
    if (code <= 65) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '';
    return '❄️';
}

function getCondition(code) {
    if (code === 0) return 'Clear sky';
    if (code <= 3)  return 'Partly cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 55) return 'Drizzle';
    if (code <= 65) return 'Rain';
    if (code <= 77) return 'Snow';
    if (code <= 82) return 'Rain showers';
    return 'Thunderstorm';
}

