import { createSlice } from '@reduxjs/toolkit'

const FAVORITES_KEY = 'weatherapp:favorites'

const loadFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    return []
  }
}

const initialState = {
  items: loadFavorites(),
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite(state, action) {
      const id = action.payload
      if (state.items.includes(id)) {
        state.items = state.items.filter((item) => item !== id)
      } else {
        state.items.push(id)
      }
    },
    setFavorites(state, action) {
      state.items = action.payload
    },
  },
})

export const { toggleFavorite, setFavorites } = favoritesSlice.actions

export const persistFavorites = (favorites) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  } catch (error) {
    // ignore persistence errors
  }
}

export default favoritesSlice.reducer
