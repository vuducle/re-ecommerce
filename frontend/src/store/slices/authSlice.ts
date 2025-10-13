import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type User = {
  id: string;
  email: string;
  isAdmin?: boolean;
  name: string;
  profileImage?: string;
  verified?: boolean;
  lastKnownLocation?: string;
  [key: string]: unknown;
};

type AuthState = {
  user: User | null;
  token?: string | null;
  authenticated: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  authenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{ user: User; token?: string }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token ?? null;
      state.authenticated = true;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.authenticated = false;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload } as User;
    },
  },
});

export const { setAuth, clearAuth, updateUser } = authSlice.actions;

export default authSlice.reducer;
