import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isMobileView: boolean;
}

const initialState: UIState = {
  isMobileView: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMobileView: (state, action: PayloadAction<boolean>) => {
      state.isMobileView = action.payload;
    },
  },
});

export const { setMobileView } = uiSlice.actions;
export default uiSlice.reducer;
