import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import languageReducer, { setLanguage } from '@/store/languageSlice';
import LanguageSwitcher from './LanguageSwitcher';

function renderWithStore() {
  const store = configureStore({
    reducer: { language: languageReducer },
  });
  const utils = render(
    <Provider store={store}>
      <LanguageSwitcher />
    </Provider>,
  );
  return { ...utils, store };
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders both language buttons', () => {
    renderWithStore();
    expect(screen.getByRole('button', { name: /switch to english/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /التبديل إلى العربية/i })).toBeInTheDocument();
  });

  it('switches locale to Arabic and updates localStorage', () => {
    const { store } = renderWithStore();
    act(() => {
      store.dispatch(setLanguage('ar'));
    });
    expect(store.getState().language.locale).toBe('ar');
    expect(store.getState().language.dir).toBe('rtl');
    expect(localStorage.getItem('language')).toBe('ar');
  });

  it('switches locale back to English', () => {
    const { store } = renderWithStore();
    act(() => {
      store.dispatch(setLanguage('ar'));
      store.dispatch(setLanguage('en'));
    });
    expect(store.getState().language.locale).toBe('en');
    expect(store.getState().language.dir).toBe('ltr');
    expect(localStorage.getItem('language')).toBe('en');
  });
});
