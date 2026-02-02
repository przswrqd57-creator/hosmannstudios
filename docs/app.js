// Hosmann Studios widgets (Location page only)
// Runs once, updates existing DOM nodes (does not append duplicates)

(function () {
  // Prevent double-run (most common cause of duplicated cards on desktop)
  if (window.__hosmannWidgetsInit) return;
  window.__hosmannWidgetsInit = true;

  function $(id) {
    return document.getElementById(id);
  }

  // Only run on the Location page
  // Requires <body class="page location-page">
  const isLocationPage = document.body && document.body.classList.contains("location-page");
  if (!isLocationPage) return;

  const weatherText = $("weatherText");
  const weatherSub = $("weatherSub");
  const countdownText = $("countdownText");
  const countdownSub = $("countdownSub");

  // If the HTML isn’t present, don’t do anything
  if (!weatherText || !countdownText) return;

  // -------------------------
  // COUNTDOWN (to Jul 31, 2026 7:30am local time)
  // -------------------------
  const target = new Date(2026, 6, 31, 7, 30, 0); // month is 0-based, 6 = July

  function formatCountdown(ms) {
    if (ms <= 0) return "0 mo 0 wk 0 d 0:00:00";

    const totalSeconds = Math.floor(ms / 1000);

    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);

    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);

    const hours = totalHours % 24;
    const totalDays = Math.floor(totalHours / 24);

    // Simple month/week breakdown (approx, but stable and readable)
    const months = Math.floor(totalDays / 30);
    const daysAfterMonths = totalDays - months * 30;

    const weeks = Math.floor(daysAfterMonths / 7);
    const days = daysAfterMonths - weeks * 7;

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${months} mo ${weeks} wk ${days} d ${hh}:${mm}:${ss}`;
  }

  function updateCountdown() {
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    countdownText.textContent = formatCountdown(diff);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // -------------------------
  // WEATHER (Firekeeper Golf Course area, falls back gracefully)
  // -------------------------
  // Firekeeper GC is near Mayetta, KS
  const lat = 39.33;
  const lon = -95.73;

  // Open-Meteo no-key endpoint
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,wind_speed_10m,weather_code" +
    "&temperature_unit=fahrenheit" +
    "&wind_speed_unit=mph" +
    "&timezone=America%2FChicago";

  const codeToText = (code) => {
    // Minimal readable mapping
    const map = {
      0: "Clear",
      1: "Mostly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
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
      82: "Heavy rain showers",
      95: "Thunderstorm",
    };
    return map[code] || "Conditions";
  };

  async function loadWeather() {
    try {
      weatherText.textContent = "Loading weather";
      weatherSub.textContent = "";

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Weather HTTP ${res.status}`);

      const data = await res.json();
      const cur = data && data.current ? data.current : null;
      if (!cur) throw new Error("Missing current weather");

      const temp = Math.round(cur.temperature_2m);
      const wind = Math.round(cur.wind_speed_10m);
      const desc = codeToText(cur.weather_code);

      weatherText.textContent = `${temp}°F · ${desc}`;
      weatherSub.textContent = `Wind ${wind} mph`;
    } catch (e) {
      // Don’t leave “Loading…” forever
      weatherText.textContent = "Weather unavailable";
      weatherSub.textContent = "Try refresh";
    }
  }

  loadWeather();
  // Refresh weather every 10 minutes
  setInterval(loadWeather, 10 * 60 * 1000);
})();
