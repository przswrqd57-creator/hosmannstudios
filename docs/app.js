(() => {
  // FireKeeper Resort area (Mayetta, KS)
  const LAT = 39.3189;
  const LON = -95.7286;

  // Fri Jul 31, 2026 7:30am America/Chicago
  // July is daylight time (CDT = UTC-5), so 07:30 CDT = 12:30 UTC
  const TARGET_UTC_MS = Date.parse("2026-07-31T12:30:00Z");

  const elWeather = document.getElementById("weather");
  const elWeatherSub = document.getElementById("weather-sub");
  const elCountdown = document.getElementById("countdown");

  // If these are missing, do nothing (prevents any fallback injection behavior)
  if (!elWeather || !elWeatherSub || !elCountdown) return;

  function weatherLabel(code) {
    const map = {
      0: "Clear",
      1: "Mostly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Fog",
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
      81: "Rain showers",
      82: "Heavy showers",
      95: "Thunderstorm"
    };
    return map[code] || "Current conditions";
  }

  function cToF(c) {
    return Math.round((c * 9) / 5 + 32);
  }

  async function loadWeather() {
    try {
      const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${LAT}&longitude=${LON}` +
        "&current=temperature_2m,weather_code,wind_speed_10m" +
        "&temperature_unit=celsius" +
        "&wind_speed_unit=mph" +
        "&timezone=America%2FChicago";

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Weather fetch failed");

      const data = await res.json();
      const cur = data.current;

      const tempF = cToF(cur.temperature_2m);
      const label = weatherLabel(cur.weather_code);
      const wind = Math.round(cur.wind_speed_10m);

      elWeather.textContent = `${tempF}°F · ${label}`;
      elWeatherSub.textContent = `Wind ${wind} mph`;
    } catch (e) {
      elWeather.textContent = "Weather unavailable";
      elWeatherSub.textContent = "";
    }
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function updateCountdown() {
    const now = Date.now();
    let diff = TARGET_UTC_MS - now;

    if (diff <= 0) {
      elCountdown.textContent = "0 mo 0 wk 0 d 00:00:00";
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);

    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);

    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);

    const hours = totalHours % 24;
    const totalDays = Math.floor(totalHours / 24);

    // Simple month + week breakdown for display
    const months = Math.floor(totalDays / 30);
    const remDaysAfterMonths = totalDays % 30;

    const weeks = Math.floor(remDaysAfterMonths / 7);
    const days = remDaysAfterMonths % 7;

    elCountdown.textContent =
      `${months} mo ${weeks} wk ${days} d ` +
      `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  }

  // Run
  loadWeather();
  updateCountdown();

  // Keep countdown live
  setInterval(updateCountdown, 1000);

  // Refresh weather every 15 min
  setInterval(loadWeather, 15 * 60 * 1000);
})();
