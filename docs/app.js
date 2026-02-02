// Location page widgets: weather + countdown
alert("app.js is running");
(function () {
  // Only run on the location page widgets if the elements exist
  const weatherText = document.getElementById("weather-text");
  const weatherSub = document.getElementById("weather-sub");
  const countdownText = document.getElementById("countdown-text");

  const hasWeather = !!weatherText;
  const hasCountdown = !!countdownText;

  if (!hasWeather && !hasCountdown) return;

  // ---- Countdown ----
  // Firekeeper weekend start, Central time, July is typically CDT (UTC-5)
  const target = new Date("2026-07-31T07:30:00-05:00");

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function renderCountdown() {
    if (!hasCountdown) return;

    const now = new Date();
    let diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) {
      countdownText.textContent = "It’s time";
      return;
    }

    let totalSeconds = Math.floor(diffMs / 1000);

    const seconds = totalSeconds % 60;
    totalSeconds = Math.floor(totalSeconds / 60);

    const minutes = totalSeconds % 60;
    totalSeconds = Math.floor(totalSeconds / 60);

    const hours = totalSeconds % 24;
    let totalDays = Math.floor(totalSeconds / 24);

    // Simple, stable breakdown: months = 30-day blocks, then weeks, then days
    const months = Math.floor(totalDays / 30);
    totalDays = totalDays % 30;

    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    countdownText.textContent =
      `${months} mo  ${weeks} wk  ${days} d  ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  }

  // ---- Weather ----
  // Use Mayetta, KS coordinates as a solid proxy for Firekeeper area
  // (If you want, we can later switch to exact course coords)
  const lat = 39.339;
  const lon = -95.721;

  function weatherCodeToText(code) {
    const map = {
      0: "Clear",
      1: "Mostly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Rime fog",
      51: "Light drizzle",
      53: "Drizzle",
      55: "Heavy drizzle",
      61: "Light rain",
      63: "Rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Snow",
      75: "Heavy snow",
      80: "Rain showers",
      81: "Heavy showers",
      82: "Violent showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Thunderstorm with heavy hail",
    };
    return map[code] || "Weather";
  }

  async function loadWeather() {
    if (!hasWeather) return;

    try {
      const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${lat}&longitude=${lon}` +
        "&temperature_unit=fahrenheit" +
        "&wind_speed_unit=mph" +
        "&current=temperature_2m,weather_code,wind_speed_10m";

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Weather fetch failed");

      const data = await res.json();
      const cur = data.current;

      if (!cur) throw new Error("No current weather data");

      const temp = Math.round(cur.temperature_2m);
      const wind = Math.round(cur.wind_speed_10m);
      const desc = weatherCodeToText(cur.weather_code);

      weatherText.textContent = `${temp}°F  ·  ${desc}`;
      weatherSub.textContent = `Wind ${wind} mph`;
    } catch (e) {
      weatherText.textContent = "Weather unavailable";
      weatherSub.textContent = "Check connection or try again";
    }
  }

  // Start
  renderCountdown();
  setInterval(renderCountdown, 1000);

  loadWeather();
  // Refresh weather every 10 minutes
  setInterval(loadWeather, 10 * 60 * 1000);
})();
