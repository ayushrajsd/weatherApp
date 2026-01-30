import { configureStore } from '@reduxjs/toolkit'
import favoritesReducer from './slices/favoritesSlice'
import settingsReducer from './slices/settingsSlice'
import weatherReducer from './slices/weatherSlice'

const store = configureStore({
  reducer: {
    weather: weatherReducer,
    favorites: favoritesReducer,
    settings: settingsReducer,
  },
})

export default store
