import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  userData: Record<string, any> | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: null,
  userData: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logIn: (state, action: PayloadAction<{ token: string; userData: Record<string, any> }>) => {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.userData = action.payload.userData;
    },
    logOut: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.userData = null;
    },
  },
});

export const { logIn, logOut } = authSlice.actions;

export default authSlice.reducer;
