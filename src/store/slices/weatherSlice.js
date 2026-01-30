import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  availableCities,
  fetchCityDetails,
  fetchDashboardCities,
  searchCities as searchCitiesApi,
} from '../../api/weatherApi'

export const loadDashboard = createAsyncThunk(
  'weather/loadDashboard',
  async () => fetchDashboardCities(),
)

export const loadCityDetails = createAsyncThunk(
  'weather/loadCityDetails',
  async (cityId) => fetchCityDetails(cityId),
)

export const searchCities = createAsyncThunk(
  'weather/searchCities',
  async (query) => searchCitiesApi(query),
)

const initialState = {
  cities: [],
  selectedCityId: availableCities[0]?.id ?? null,
  selectedCity: null,
  searchResults: [],
  status: 'idle',
  detailStatus: 'idle',
  searchStatus: 'idle',
  lastUpdated: null,
  error: null,
}

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    selectCity(state, action) {
      state.selectedCityId = action.payload
    },
    clearSearch(state) {
      state.searchResults = []
      state.searchStatus = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboard.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(loadDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.cities = action.payload.cities
        state.lastUpdated = action.payload.updatedAt
      })
      .addCase(loadDashboard.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(loadCityDetails.pending, (state) => {
        state.detailStatus = 'loading'
      })
      .addCase(loadCityDetails.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.selectedCity = action.payload.city
        state.lastUpdated = action.payload.updatedAt
      })
      .addCase(loadCityDetails.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.error = action.error.message
      })
      .addCase(searchCities.pending, (state) => {
        state.searchStatus = 'loading'
      })
      .addCase(searchCities.fulfilled, (state, action) => {
        state.searchStatus = 'succeeded'
        state.searchResults = action.payload
      })
      .addCase(searchCities.rejected, (state, action) => {
        state.searchStatus = 'failed'
        state.error = action.error.message
      })
  },
})

export const { selectCity, clearSearch } = weatherSlice.actions

export default weatherSlice.reducer
