(function () {
  const isLocationPage = document.body && document.body.classList.contains("location-page")
  if (!isLocationPage) return

  const mainEl = document.getElementById("wx-main")
  const subEl = document.getElementById("wx-sub")
  if (!mainEl || !subEl) return

  const lat = 39.34
  const lon = -95.85

  const codeToText = (code) => {
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
      80: "Light showers",
      81: "Showers",
      82: "Heavy showers",
      95: "Thunderstorm",
      96: "Thunderstorm w hail",
      99: "Thunderstorm w heavy hail",
    }
    return map[code] || "Weather"
  }

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,wind_speed_10m,weather_code` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph` +
    `&timezone=America%2FChicago`

  const timeout = (ms) =>
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))

  async function loadWeather() {
    try {
      mainEl.textContent = "Loading weather"
      subEl.textContent = ""

      const res = await Promise.race([fetch(url, { cache: "no-store" }), timeout(8000)])
      if (!res.ok) throw new Error(`http ${res.status}`)

      const data = await res.json()
      const cur = data && data.current
      if (!cur) throw new Error("no current")

      const temp = Math.round(cur.temperature_2m)
      const wind = Math.round(cur.wind_speed_10m)
      const desc = codeToText(cur.weather_code)

      mainEl.textContent = `${temp}°F · ${desc}`
      subEl.textContent = `Wind ${wind} mph`
    } catch (e) {
      mainEl.textContent = "Weather unavailable"
      subEl.textContent = "Refresh in a minute"
    }
  }

  loadWeather()
})()
