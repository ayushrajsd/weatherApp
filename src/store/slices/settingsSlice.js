import { createSlice } from '@reduxjs/toolkit'

const SETTINGS_KEY = 'weatherapp:settings'

const loadSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    return stored ? JSON.parse(stored) : { unit: 'C' }
  } catch (error) {
    return { unit: 'C' }
  }
}

const initialState = loadSettings()

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleUnit(state) {
      state.unit = state.unit === 'C' ? 'F' : 'C'
    },
    setUnit(state, action) {
      state.unit = action.payload
    },
  },
})

export const { toggleUnit, setUnit } = settingsSlice.actions

export const persistSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    // ignore persistence errors
  }
}

export default settingsSlice.reducer
