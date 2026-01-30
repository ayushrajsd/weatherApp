const cities = [
  {
    id: 'nyc',
    name: 'New York',
    country: 'USA',
    baseTempC: 22,
    humidity: 62,
    windSpeed: 18,
    windDirection: 'NW',
    pressure: 1016,
    dewPoint: 16,
    uvIndex: 5,
  },
  {
    id: 'lon',
    name: 'London',
    country: 'UK',
    baseTempC: 18,
    humidity: 70,
    windSpeed: 14,
    windDirection: 'W',
    pressure: 1012,
    dewPoint: 12,
    uvIndex: 4,
  },
  {
    id: 'tok',
    name: 'Tokyo',
    country: 'Japan',
    baseTempC: 26,
    humidity: 58,
    windSpeed: 12,
    windDirection: 'SE',
    pressure: 1009,
    dewPoint: 19,
    uvIndex: 7,
  },
  {
    id: 'syd',
    name: 'Sydney',
    country: 'Australia',
    baseTempC: 20,
    humidity: 55,
    windSpeed: 16,
    windDirection: 'NE',
    pressure: 1018,
    dewPoint: 14,
    uvIndex: 6,
  },
  {
    id: 'cpt',
    name: 'Cape Town',
    country: 'South Africa',
    baseTempC: 17,
    humidity: 64,
    windSpeed: 22,
    windDirection: 'SW',
    pressure: 1020,
    dewPoint: 11,
    uvIndex: 5,
  },
]

const conditions = [
  { label: 'Sunny', icon: '☀️' },
  { label: 'Partly Cloudy', icon: '⛅' },
  { label: 'Cloudy', icon: '☁️' },
  { label: 'Showers', icon: '🌦️' },
  { label: 'Rain', icon: '🌧️' },
  { label: 'Thunderstorms', icon: '⛈️' },
]

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const generateCondition = (seed) => conditions[seed % conditions.length]

const generateHourly = (baseTempC) => {
  const now = new Date()
  return Array.from({ length: 24 }, (_, index) => {
    const hour = new Date(now.getTime() + index * 60 * 60 * 1000)
    const tempC = baseTempC + Math.sin(index / 3) * 4 + (index % 5) * 0.3
    return {
      time: `${hour.getHours().toString().padStart(2, '0')}:00`,
      tempC: Number(tempC.toFixed(1)),
      precipitation: Number((Math.max(0, Math.sin(index / 4)) * 4).toFixed(1)),
      windSpeed: Number((8 + Math.cos(index / 3) * 6).toFixed(1)),
    }
  })
}

const generateDaily = (baseTempC) => {
  const today = new Date()
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getTime() + index * 24 * 60 * 60 * 1000)
    const tempC = baseTempC + Math.sin(index / 2) * 3
    return {
      day: dayNames[date.getDay()],
      highC: Number((tempC + 4).toFixed(1)),
      lowC: Number((tempC - 4).toFixed(1)),
      precipitation: Number((Math.max(0, Math.sin(index / 2)) * 6).toFixed(1)),
      condition: generateCondition(index + 2),
    }
  })
}

const generateHistorical = (baseTempC) => {
  const today = new Date()
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today.getTime() - (13 - index) * 24 * 60 * 60 * 1000)
    const tempC = baseTempC + Math.sin(index / 2) * 3 - 1
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      avgTempC: Number(tempC.toFixed(1)),
      windSpeed: Number((10 + Math.cos(index) * 4).toFixed(1)),
    }
  })
}

const buildCityPayload = (city, seed) => {
  const condition = generateCondition(seed)
  const tempC = Number((city.baseTempC + Math.sin(seed) * 2).toFixed(1))
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    condition,
    tempC,
    humidity: city.humidity,
    windSpeed: city.windSpeed,
    windDirection: city.windDirection,
    pressure: city.pressure,
    dewPoint: city.dewPoint,
    uvIndex: city.uvIndex,
    hourly: generateHourly(city.baseTempC),
    forecast: generateDaily(city.baseTempC),
    historical: generateHistorical(city.baseTempC),
  }
}

export const fetchDashboardCities = async () => {
  await delay(300)
  const seed = new Date().getMinutes()
  return {
    updatedAt: new Date().toISOString(),
    cities: cities.map((city, index) => buildCityPayload(city, seed + index)),
  }
}

export const fetchCityDetails = async (cityId) => {
  await delay(250)
  const city = cities.find((item) => item.id === cityId) || cities[0]
  return {
    updatedAt: new Date().toISOString(),
    city: buildCityPayload(city, city.baseTempC),
  }
}

export const searchCities = async (query) => {
  await delay(150)
  if (!query) {
    return []
  }
  const normalized = query.toLowerCase()
  return cities
    .filter((city) => city.name.toLowerCase().includes(normalized))
    .map((city) => ({ id: city.id, name: city.name, country: city.country }))
}

export const availableCities = cities.map((city) => ({
  id: city.id,
  name: city.name,
  country: city.country,
}))
