document.addEventListener("DOMContentLoaded", () => {
  initWeather();
  initCountdown();
});

function initWeather() {
  const el = document.getElementById("weather");
  if (!el) return;

  fetch("https://api.open-meteo.com/v1/forecast?latitude=39.33&longitude=-96.97&current_weather=true&temperature_unit=fahrenheit")
    .then(r => r.json())
    .then(data => {
      if (!data.current_weather) return;
      const t = Math.round(data.current_weather.temperature);
      const w = data.current_weather.windspeed;
      el.textContent = `${t}°F · Wind ${w} mph`;
    })
    .catch(() => {
      el.textContent = "Weather unavailable";
    });
}

function initCountdown() {
  const el = document.getElementById("countdown");
  if (!el) return;

  const target = new Date("July 31, 2026 07:30:00").getTime();

  function tick() {
    const now = Date.now();
    let diff = Math.max(0, target - now);

    const sec = Math.floor(diff / 1000) % 60;
    const min = Math.floor(diff / 60000) % 60;
    const hr  = Math.floor(diff / 3600000) % 24;
    const day = Math.floor(diff / 86400000);

    el.textContent = `${day}d ${hr}h ${min}m ${sec}s`;
  }

  tick();
  setInterval(tick, 1000);
}
