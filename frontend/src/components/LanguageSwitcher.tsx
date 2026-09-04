import { useAppSelector, useAppDispatch, setLanguage } from '@/store';

export default function LanguageSwitcher() {
  const dispatch = useAppDispatch();
  const { locale } = useAppSelector((s) => s.language);

  return (
    <div className="flex items-center gap-1 bg-ink-100 rounded-lg p-0.5">
      <button
        onClick={() => dispatch(setLanguage('en'))}
        className={`px-2 py-1 text-xs font-medium rounded transition-all ${
          locale === 'en'
            ? 'bg-ink-900 text-ink'
            : 'text-ink-600 hover:text-ink-900'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => dispatch(setLanguage('ar'))}
        className={`px-2 py-1 text-xs font-medium rounded transition-all ${
          locale === 'ar'
            ? 'bg-ink-900 text-ink'
            : 'text-ink-600 hover:text-ink-900'
        }`}
      >
        AR
      </button>
    </div>
  );
}
