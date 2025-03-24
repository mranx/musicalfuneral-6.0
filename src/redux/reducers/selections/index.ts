import { createSlice } from '@reduxjs/toolkit';




interface SelectionState {
  musicFormat: number | null;
  secType: number | null;
  preferredService: number | null;
}

const initialState: SelectionState = {
  musicFormat: null,
  secType: null,
  preferredService: null,
};

const selectionSlice = createSlice({
  name: 'selections',
  initialState,
  reducers: {
    setMusicFormat(state, action) {
      state.musicFormat = action.payload;
    },
    setSecType(state, action) {
      state.secType = action.payload;
    },
    setPreferredService(state, action) {
      state.preferredService = action.payload;
    },
  },
});

export const { setMusicFormat, setSecType, setPreferredService } = selectionSlice.actions;
export default selectionSlice.reducer;

