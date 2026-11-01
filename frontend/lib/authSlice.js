import { createSlice } from "@reduxjs/toolkit";

const initialState = { token: null, user: null, ready: false };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.ready = true;
    },
    restoreSession(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.ready = true;
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      state.ready = true;
    },
  },
});

export const { setCredentials, restoreSession, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
