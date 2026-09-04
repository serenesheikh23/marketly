import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Language = 'en' | 'ar';

interface LanguageState {
  locale: Language;
  dir: 'ltr' | 'rtl';
}

const stored = (localStorage.getItem('language') as Language) || 'en';

// Apply dir/lang on initial load
if (typeof document !== 'undefined') {
  document.documentElement.dir = stored === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = stored;
}

const initialState: LanguageState = {
  locale: stored,
  dir: stored === 'ar' ? 'rtl' : 'ltr',
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<Language>) {
      state.locale = action.payload;
      state.dir = action.payload === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem('language', action.payload);
      document.documentElement.dir = state.dir;
      document.documentElement.lang = action.payload;
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
