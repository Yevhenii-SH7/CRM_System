# Локализация / Localization

Проект поддерживает многоязычность с помощью системы интернационализации (i18n).

## Поддерживаемые языки / Supported Languages

- 🇺🇸 **English** (en) - по умолчанию / default
- 🇩🇪 **Deutsch** (de) - немецкий / German

## Структура файлов / File Structure

```
frontend/src/
├── locales/
│   ├── en.json          # Английские переводы
│   └── de.json          # Немецкие переводы
├── contexts/
│   └── LocaleContext.tsx # Контекст локализации
└── components/ui/
    └── LanguageSwitcher.tsx # Переключатель языков
```

## Использование / Usage

### В компонентах React

```tsx
import { useLocale } from '../contexts/LocaleContext';

function MyComponent() {
  const { t, locale, setLocale } = useLocale();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

### Переключение языка

Используйте компонент `LanguageSwitcher` или вызовите `setLocale('de')` программно.

## Добавление новых переводов / Adding New Translations

1. Добавьте ключ в `frontend/src/locales/en.json`
2. Добавьте перевод в `frontend/src/locales/de.json`
3. Используйте `t('your.new.key')` в компонентах

### Пример / Example

**en.json:**
```json
{
  "mySection": {
    "newFeature": "New Feature"
  }
}
```

**de.json:**
```json
{
  "mySection": {
    "newFeature": "Neue Funktion"
  }
}
```

**Компонент:**
```tsx
<Button>{t('mySection.newFeature')}</Button>
```

## Добавление нового языка / Adding New Language

1. Создайте файл `frontend/src/locales/[код_языка].json`
2. Добавьте язык в `LocaleContext.tsx`:
   ```tsx
   const translations = {
     en: enTranslations,
     de: deTranslations,
     fr: frTranslations, // новый язык
   };
   ```
3. Обновите тип `Locale` и `LanguageSwitcher`

## Сохранение настроек / Settings Persistence

Выбранный язык автоматически сохраняется в `localStorage` и восстанавливается при следующем посещении.

## Текущий статус локализации / Current Localization Status

### ✅ Переведено / Translated
- Header (навигация)
- Dashboard (основные метрики)
- Общие элементы (кнопки, формы)

### 🔄 В процессе / In Progress
- Формы создания/редактирования
- Модальные окна
- Сообщения об ошибках

### ⏳ Планируется / Planned
- Полная локализация всех компонентов
- Форматирование дат и чисел по локали
- Поддержка RTL языков