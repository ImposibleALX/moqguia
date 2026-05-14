// Weather service for Moquegua using wttr.in (free, no API key required)

export interface MoqueguaWeather {
  tempC: number;
  condition: string;
  emoji: string;
  windKmph: number;
  humidity: number;
  feelsLikeC: number;
  isAlertWorthy: boolean; // Strong wind / extreme cold at high altitude
}

interface WttrCondition {
  temp_C: string;
  FeelsLikeC: string;
  weatherDesc: Array<{ value: string }>;
  windspeedKmph: string;
  humidity: string;
}

interface WttrResponse {
  current_condition?: WttrCondition[];
}

function descToEmoji(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes("sunny") || d.includes("clear")) return "☀️";
  if (d.includes("partly")) return "⛅";
  if (d.includes("overcast") || d.includes("cloudy")) return "☁️";
  if (d.includes("rain") || d.includes("drizzle")) return "🌧️";
  if (d.includes("thunder") || d.includes("storm")) return "⛈️";
  if (d.includes("snow") || d.includes("sleet")) return "🌨️";
  if (d.includes("fog") || d.includes("mist") || d.includes("haze")) return "🌫️";
  return "🌤️";
}

/** Fetch current weather for Moquegua (free, no API key) */
export async function fetchMoqueguaWeather(): Promise<MoqueguaWeather> {
  // Cache for 30 minutes to avoid hammering the API
  const CACHE_KEY = "moquegua-weather";
  const CACHE_TTL = 30 * 60 * 1000;

  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { data, ts } = JSON.parse(cached) as { data: MoqueguaWeather; ts: number };
      if (Date.now() - ts < CACHE_TTL) return data;
    } catch { /* ignore */ }
  }

  const url = "https://wttr.in/Moquegua,Peru?format=j1";
  const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!resp.ok) throw new Error("Weather service unavailable");

  const json = (await resp.json()) as WttrResponse;
  const c = json.current_condition?.[0];
  if (!c) throw new Error("No weather data");

  const tempC = parseInt(c.temp_C, 10);
  const windKmph = parseInt(c.windspeedKmph, 10);
  const desc = c.weatherDesc?.[0]?.value ?? "";

  const weather: MoqueguaWeather = {
    tempC,
    condition: desc,
    emoji: descToEmoji(desc),
    windKmph,
    humidity: parseInt(c.humidity, 10),
    feelsLikeC: parseInt(c.FeelsLikeC, 10),
    // Alert if cold + strong wind (Cerro Baúl at 2590m can be dangerous)
    isAlertWorthy: tempC < 8 || windKmph > 50,
  };

  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: weather, ts: Date.now() }));
  return weather;
}
