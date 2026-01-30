import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'
import { availableCities } from './api/weatherApi'
import {
  clearSearch,
  loadCityDetails,
  loadDashboard,
  searchCities,
  selectCity,
} from './store/slices/weatherSlice'
import { persistFavorites, toggleFavorite } from './store/slices/favoritesSlice'
import { persistSettings, toggleUnit } from './store/slices/settingsSlice'

const formatTemp = (tempC, unit) => {
  if (Number.isNaN(tempC)) {
    return '--'
  }
  if (unit === 'F') {
    return `${Math.round(tempC * 1.8 + 32)}°F`
  }
  return `${Math.round(tempC)}°C`
}

const formatTime = (iso) => {
  if (!iso) {
    return '—'
  }
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const DashboardCard = ({ city, unit, isFavorite, onSelect, onToggleFavorite }) => (
  <button className="city-card" type="button" onClick={() => onSelect(city.id)}>
    <div className="city-card__header">
      <div>
        <h3>{city.name}</h3>
        <p className="city-card__sub">
          {city.country} · {city.condition.label}
        </p>
      </div>
      <span className="city-card__icon" aria-hidden>
        {city.condition.icon}
      </span>
    </div>
    <div className="city-card__body">
      <p className="city-card__temp">{formatTemp(city.tempC, unit)}</p>
      <div className="city-card__meta">
        <span>Humidity {city.humidity}%</span>
        <span>Wind {city.windSpeed} km/h</span>
      </div>
    </div>
    <div className="city-card__footer">
      <span>Pressure {city.pressure} hPa</span>
      <button
        type="button"
        className={`favorite-btn ${isFavorite ? 'is-active' : ''}`}
        onClick={(event) => {
          event.stopPropagation()
          onToggleFavorite(city.id)
        }}
      >
        {isFavorite ? '★ Favorite' : '☆ Favorite'}
      </button>
    </div>
  </button>
)

const DetailModal = ({ city, unit, isOpen, onClose }) => {
  const [range, setRange] = useState('hourly')

  if (!city || !isOpen) {
    return null
  }

  const tempData =
    range === 'hourly'
      ? city.hourly.map((item) => ({
          label: item.time,
          temp: item.tempC,
        }))
      : city.forecast.map((item) => ({
          label: item.day,
          temp: item.highC,
        }))

  return (
    <div className="modal">
      <div className="modal__content">
        <header className="modal__header">
          <div>
            <h2>
              {city.name}, {city.country}
            </h2>
            <p>
              {city.condition.icon} {city.condition.label}
            </p>
          </div>
          <button type="button" className="modal__close" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="modal__grid">
          <section className="panel">
            <div className="panel__title">
              <h3>Temperature Trends</h3>
              <div className="segmented">
                <button
                  type="button"
                  className={range === 'hourly' ? 'is-active' : ''}
                  onClick={() => setRange('hourly')}
                >
                  Hourly
                </button>
                <button
                  type="button"
                  className={range === 'daily' ? 'is-active' : ''}
                  onClick={() => setRange('daily')}
                >
                  7-Day
                </button>
              </div>
            </div>
            <div className="chart">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={tempData}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatTemp(value, unit)} />
                  <Line type="monotone" dataKey="temp" stroke="#4c6ef5" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="panel">
            <h3>Hour-by-hour Forecast</h3>
            <div className="chart">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={city.hourly}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatTemp(value, unit)} />
                  <Area type="monotone" dataKey="tempC" stroke="#22b8cf" fill="#99e9f2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="panel">
            <h3>5-7 Day Forecast</h3>
            <div className="forecast-grid">
              {city.forecast.map((day) => (
                <div key={day.day} className="forecast-card">
                  <span>{day.day}</span>
                  <span className="forecast-card__icon">{day.condition.icon}</span>
                  <span>{formatTemp(day.highC, unit)}</span>
                  <small>{formatTemp(day.lowC, unit)}</small>
                </div>
              ))}
            </div>
          </section>
          <section className="panel">
            <h3>Precipitation & Wind</h3>
            <div className="chart">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={city.hourly}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="precipitation" fill="#748ffc" name="Precipitation (mm)" />
                  <Bar dataKey="windSpeed" fill="#ffd43b" name="Wind (km/h)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="panel">
            <h3>Historical Trend</h3>
            <div className="chart">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={city.historical}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgTempC" stroke="#ff922b" />
                  <Line type="monotone" dataKey="windSpeed" stroke="#40c057" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="panel panel--stats">
            <h3>Detailed Stats</h3>
            <div className="stats-grid">
              <div>
                <strong>{formatTemp(city.tempC, unit)}</strong>
                <span>Current Temp</span>
              </div>
              <div>
                <strong>{city.humidity}%</strong>
                <span>Humidity</span>
              </div>
              <div>
                <strong>{city.pressure} hPa</strong>
                <span>Pressure</span>
              </div>
              <div>
                <strong>{city.dewPoint}°</strong>
                <span>Dew Point</span>
              </div>
              <div>
                <strong>{city.uvIndex}</strong>
                <span>UV Index</span>
              </div>
              <div>
                <strong>
                  {city.windSpeed} km/h {city.windDirection}
                </strong>
                <span>Wind</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function App() {
  const dispatch = useDispatch()
  const { cities, selectedCityId, selectedCity, searchResults, lastUpdated, status } =
    useSelector((state) => state.weather)
  const favorites = useSelector((state) => state.favorites.items)
  const unit = useSelector((state) => state.settings.unit)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const orderedCities = useMemo(() => {
    const favoriteSet = new Set(favorites)
    return [...cities].sort((a, b) => {
      const aFav = favoriteSet.has(a.id) ? 0 : 1
      const bFav = favoriteSet.has(b.id) ? 0 : 1
      return aFav - bFav
    })
  }, [cities, favorites])

  useEffect(() => {
    dispatch(loadDashboard())
  }, [dispatch])

  useEffect(() => {
    if (selectedCityId) {
      dispatch(loadCityDetails(selectedCityId))
    }
  }, [dispatch, selectedCityId])

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(loadDashboard())
    }, 60000)
    return () => clearInterval(interval)
  }, [dispatch])

  useEffect(() => {
    persistFavorites(favorites)
  }, [favorites])

  useEffect(() => {
    persistSettings({ unit })
  }, [unit])

  const handleSearchChange = (event) => {
    const value = event.target.value
    setSearchTerm(value)
    dispatch(searchCities(value))
  }

  const handleCitySelect = (cityId) => {
    dispatch(selectCity(cityId))
    setIsDetailOpen(true)
  }

  const handleSearchSelect = (cityId) => {
    dispatch(selectCity(cityId))
    dispatch(clearSearch())
    setSearchTerm('')
  }

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="hero__eyebrow">Weather Analytics Dashboard</p>
          <h1>Real-time climate insights for multiple cities.</h1>
          <p className="hero__sub">
            Monitor live conditions, interactive forecasts, and long-term trends with mock API
            data refreshed every 60 seconds.
          </p>
        </div>
        <div className="hero__actions">
          <div className="status">
            <span className={`status__dot ${status === 'loading' ? 'is-loading' : ''}`} />
            Last updated {formatTime(lastUpdated)}
          </div>
          <button type="button" className="btn" onClick={() => dispatch(loadDashboard())}>
            Refresh Now
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => dispatch(toggleUnit())}>
            {unit === 'C' ? 'Switch to °F' : 'Switch to °C'}
          </button>
        </div>
      </header>

      <section className="panel search-panel">
        <div className="search">
          <label htmlFor="city-search">Search cities</label>
          <input
            id="city-search"
            value={searchTerm}
            placeholder="Start typing a city name"
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <div className="search__results">
              {(searchResults.length ? searchResults : availableCities).map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSearchSelect(city.id)}
                >
                  {city.name}, {city.country}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="favorites-summary">
          <h3>Favorites</h3>
          <p>
            {favorites.length
              ? `${favorites.length} pinned cities will stay at the top of your dashboard.`
              : 'Star a city to keep it pinned here.'}
          </p>
        </div>
      </section>

      <section className="dashboard">
        <div className="dashboard__header">
          <h2>City Overview</h2>
          <p>Click a card to explore detailed analytics.</p>
        </div>
        <div className="dashboard__grid">
          {orderedCities.map((city) => (
            <DashboardCard
              key={city.id}
              city={city}
              unit={unit}
              isFavorite={favorites.includes(city.id)}
              onSelect={handleCitySelect}
              onToggleFavorite={(cityId) => dispatch(toggleFavorite(cityId))}
            />
          ))}
        </div>
      </section>

      <section className="panel highlights">
        <div>
          <h3>Interactive Visualizations</h3>
          <p>
            Explore temperature, precipitation, and wind metrics with interactive charts and
            tooltips across hourly, daily, and historical ranges.
          </p>
        </div>
        <div className="highlights__stats">
          <div>
            <strong>{selectedCity?.forecast?.length ?? 0}</strong>
            <span>Forecast Days</span>
          </div>
          <div>
            <strong>{selectedCity?.hourly?.length ?? 0}</strong>
            <span>Hourly Points</span>
          </div>
          <div>
            <strong>{favorites.length}</strong>
            <span>Favorites</span>
          </div>
        </div>
      </section>

      <DetailModal
        city={selectedCity}
        unit={unit}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  )
}

export default App
