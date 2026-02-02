/* Location widgets: weather + countdown
   Safe to include on every page because it only runs if the elements exist
*/
(function () {
  // Only run on pages that have the widget containers
  const weatherBox = document.getElementById("weather-box");
  const countdownBox = document.getElementById("countdown-box");
  if (!weatherBox && !countdownBox) return;

  // Firekeeper Golf Course coordinates (Mayetta, KS)
  const LAT = 39.1473;
  const LON = -95.9009;

  // --- Weather (Open-Meteo, no key) ---
  async function loadWeather() {
    if (!weatherBox) return;

    try {
      const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${LAT}&longitude=${LON}` +
        "&current=temperature_2m,wind_speed_10m,weather_code" +
        "&temperature_unit=fahrenheit" +
        "&wind_speed_unit=mph" +
        "&timezone=America%2FChicago";

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Weather fetch failed");
      const data = await res.json();

      const cur = data.current;
      const temp = Math.round(cur.temperature_2m);
      const wind = Math.round(cur.wind_speed_10m);
      const code = cur.weather_code;

      // Keep it simple and reliable, show the numeric code
      weatherBox.innerHTML =
        `<div><strong>${temp}°F</strong> at Firekeeper</div>` +
        `<div>Wind ${wind} mph</div>` +
        `<div>Condition code ${code}</div>`;
    } catch (e) {
      weatherBox.textContent = "Weather unavailable";
    }
  }

  // Refresh weather every 10 minutes
  loadWeather();
  setInterval(loadWeather, 10 * 60 * 1000);

  // --- Countdown ---
  // Target: Fri Jul 31, 2026 7:30am Central Time
  // July in Kansas is CDT (UTC-5)
  const target = new Date("2026-07-31T07:30:00-05:00");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  // Calendar month difference helper (stable, avoids “30-day months” math)
  function diffMonths(from, to) {
    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    const test = new Date(from);
    test.setMonth(test.getMonth() + months);

    // If we overshot, step back
    if (test > to) {
      months -= 1;
    }
    return Math.max(0, months);
  }

  function updateCountdown() {
    if (!countdownBox) return;

    const now = new Date();
    if (now >= target) {
      countdownBox.innerHTML = "<strong>It’s go time</strong>";
      return;
    }

    // Months first (calendar accurate)
    const months = diffMonths(now, target);
    const afterMonths = new Date(now);
    afterMonths.setMonth(afterMonths.getMonth() + months);

    // Remaining ms after removing months
    let remaining = target - afterMonths;

    const sec = Math.floor(remaining / 1000);
    const weeks = Math.floor(sec / (7 * 24 * 3600));
    let r = sec - weeks * 7 * 24 * 3600;

    const days = Math.floor(r / (24 * 3600));
    r -= days * 24 * 3600;

    const hours = Math.floor(r / 3600);
    r -= hours * 3600;

    const minutes = Math.floor(r / 60);
    const seconds = r - minutes * 60;

    countdownBox.innerHTML =
      `<div><strong>${months}</strong> mo  <strong>${weeks}</strong> wk  <strong>${days}</strong> d</div>` +
      `<div><strong>${pad(hours)}</strong> h  <strong>${pad(minutes)}</strong> m  <strong>${pad(seconds)}</strong> s</div>`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();* Reserved for future interactivity */
