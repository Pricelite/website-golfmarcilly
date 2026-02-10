type WeatherApiCurrent = {
  time: string;
  temperature_2m: number;
  weather_code: number;
  wind_speed_10m: number;
};

type WeatherApiDaily = {
  temperature_2m_max: number[];
  temperature_2m_min: number[];
};

type WeatherApiHourly = {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  precipitation: number[];
};

type WeatherApiResponse = {
  current?: WeatherApiCurrent;
  daily?: WeatherApiDaily;
  hourly?: WeatherApiHourly;
};

export type WeatherVisual =
  | "sun"
  | "partly"
  | "cloud"
  | "fog"
  | "rain"
  | "snow"
  | "storm";

export type WeatherHour = {
  label: string;
  temperatureC: number;
  windKmh: number;
  precipitationMm: number;
  visual: WeatherVisual;
};

export type TodayWeather = {
  summary: string;
  temperatureC: number;
  minC: number;
  maxC: number;
  windKmh: number;
  precipitationNext3hMm: number;
  visual: WeatherVisual;
  updatedAtLabel: string;
  hourly: WeatherHour[];
};

const MARCILLY_LATITUDE = 47.764;
const MARCILLY_LONGITUDE = 2.189;

const WEATHER_LABELS: Record<number, string> = {
  0: "Ciel degage",
  1: "Peu nuageux",
  2: "Partiellement nuageux",
  3: "Couvert",
  45: "Brouillard",
  48: "Brouillard givrant",
  51: "Bruine legere",
  53: "Bruine moderee",
  55: "Bruine dense",
  56: "Bruine verglacante legere",
  57: "Bruine verglacante dense",
  61: "Pluie faible",
  63: "Pluie moderee",
  65: "Pluie forte",
  66: "Pluie verglacante legere",
  67: "Pluie verglacante forte",
  71: "Neige faible",
  73: "Neige moderee",
  75: "Neige forte",
  77: "Grains de neige",
  80: "Averses faibles",
  81: "Averses moderees",
  82: "Averses fortes",
  85: "Averses de neige faibles",
  86: "Averses de neige fortes",
  95: "Orage",
  96: "Orage avec grele legere",
  99: "Orage avec grele forte",
};

function toOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatHourLabel(value: string): string {
  if (typeof value !== "string" || value.length < 16) {
    return "--:--";
  }

  return value.slice(11, 16);
}

function getWeatherVisual(code: number): WeatherVisual {
  if (code === 0) {
    return "sun";
  }

  if (code === 1 || code === 2) {
    return "partly";
  }

  if (code === 3) {
    return "cloud";
  }

  if (code === 45 || code === 48) {
    return "fog";
  }

  if (
    code === 51 ||
    code === 53 ||
    code === 55 ||
    code === 56 ||
    code === 57 ||
    code === 61 ||
    code === 63 ||
    code === 65 ||
    code === 66 ||
    code === 67 ||
    code === 80 ||
    code === 81 ||
    code === 82
  ) {
    return "rain";
  }

  if (
    code === 71 ||
    code === 73 ||
    code === 75 ||
    code === 77 ||
    code === 85 ||
    code === 86
  ) {
    return "snow";
  }

  if (code === 95 || code === 96 || code === 99) {
    return "storm";
  }

  return "cloud";
}

function parseHourly(data: WeatherApiHourly | undefined, currentTime: string): WeatherHour[] {
  if (!data) {
    return [];
  }

  const {
    time,
    temperature_2m: temperatures,
    weather_code: codes,
    wind_speed_10m: winds,
    precipitation: precipitationValues,
  } = data;

  if (
    !Array.isArray(time) ||
    !Array.isArray(temperatures) ||
    !Array.isArray(codes) ||
    !Array.isArray(winds) ||
    !Array.isArray(precipitationValues)
  ) {
    return [];
  }

  let startIndex = time.findIndex((value) => value === currentTime);

  if (startIndex < 0) {
    startIndex = time.findIndex((value) => value >= currentTime);
  }

  if (startIndex < 0) {
    startIndex = 0;
  }

  const result: WeatherHour[] = [];
  const end = Math.min(startIndex + 3, time.length);

  for (let index = startIndex; index < end; index += 1) {
    const temperature = temperatures[index];
    const code = codes[index];
    const wind = winds[index];
    const precipitation = precipitationValues[index];

    if (
      !isValidNumber(temperature) ||
      !isValidNumber(code) ||
      !isValidNumber(wind) ||
      !isValidNumber(precipitation)
    ) {
      continue;
    }

    result.push({
      label: formatHourLabel(time[index]),
      temperatureC: toOneDecimal(temperature),
      windKmh: toOneDecimal(wind),
      precipitationMm: toOneDecimal(precipitation),
      visual: getWeatherVisual(code),
    });
  }

  return result;
}

function parseWeatherResponse(payload: unknown): TodayWeather | null {
  const data = payload as WeatherApiResponse;

  if (!data.current || !data.daily) {
    return null;
  }

  const { current, daily } = data;
  const max = daily.temperature_2m_max?.[0];
  const min = daily.temperature_2m_min?.[0];
  const hourly = parseHourly(data.hourly, current.time);
  const precipitationNext3hMm = toOneDecimal(
    hourly.reduce((accumulator, item) => accumulator + item.precipitationMm, 0),
  );

  if (
    !isValidNumber(current.temperature_2m) ||
    !isValidNumber(current.weather_code) ||
    !isValidNumber(current.wind_speed_10m) ||
    !isValidNumber(max) ||
    !isValidNumber(min)
  ) {
    return null;
  }

  return {
    summary: WEATHER_LABELS[current.weather_code] ?? "Conditions variables",
    temperatureC: toOneDecimal(current.temperature_2m),
    minC: toOneDecimal(min),
    maxC: toOneDecimal(max),
    windKmh: toOneDecimal(current.wind_speed_10m),
    precipitationNext3hMm,
    visual: getWeatherVisual(current.weather_code),
    updatedAtLabel: formatHourLabel(current.time),
    hourly,
  };
}

export async function getTodayWeather(): Promise<TodayWeather | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${MARCILLY_LATITUDE}` +
    `&longitude=${MARCILLY_LONGITUDE}` +
    "&current=temperature_2m,weather_code,wind_speed_10m" +
    "&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation" +
    "&daily=temperature_2m_max,temperature_2m_min" +
    "&forecast_days=2&timezone=Europe%2FParis";

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    return parseWeatherResponse(payload);
  } catch {
    return null;
  }
}
