# Data Transformers

Centralized data transformers for various marketing channels.

## Usage

### CLI
```bash
npm run transform input.json output.json meta
```

### Programmatic
```typescript
import { applyDataTransformations } from '@your-org/data-transformers';

const transformed = applyDataTransformations(data, 'meta');
```

### Available Channels
- `meta` / `facebook` - Meta/Facebook ads
- `google` - Google Ads
- `tiktok` - TikTok ads
- `noop` - No transformations

## Adding New Channels

1. Create transformer in `src/transformers/`
2. Register in `src/registry.ts`
3. Export from `src/index.ts`


# Настройка трансформаций данных

## 🎛️ **1. Через интерфейс GitHub Actions**

При запуске workflow вы увидите новые параметры:

### **Enable data transformations**
- ✅ `true` (по умолчанию) - включить трансформации
- ❌ `false` - отключить, использовать сырые данные

### **Data source channel**
- `meta` (по умолчанию) - для Facebook/Meta данных
- `google` - для Google Ads
- `tiktok` - для TikTok Ads
- `noop` - без трансформаций

## 🔧 **2. Через переменные репозитория (vars)**

В Settings → Secrets and variables → Actions → Variables:

### **ENABLE_TRANSFORMATIONS**
```
Значение: true
Описание: Включить трансформации по умолчанию
```

### **DATA_CHANNEL**
```
Значение: meta
Описание: Канал данных по умолчанию
```

### **FB_FIELDS** (уже есть)
```
Значение: date_start,date_stop,account_id,campaign_id,actions,conversions,spend,clicks
Описание: Поля Facebook по умолчанию
```

## 🎯 **3. Логика приоритетов**

```text
# Приоритет настроек (от высшего к низшему):
Параметр в интерфейсе GitHub Actions
Переменная репозитория (vars.*)
Значение по умолчанию в workflow

# Пример:
ENABLE_TRANSFORMATIONS: ${{ 
  github.event.inputs.enable_transformations != 'false' && 
  (vars.ENABLE_TRANSFORMATIONS != 'false') 
}}
```

## 📊 **4. Примеры использования**

### **Случай 1: Обычный запуск**
- Интерфейс: `Enable transformations = true`, `Channel = meta`
- Результат: Meta объекты разворачиваются

### **Случай 2: Отключить трансформации**
- Интерфейс: `Enable transformations = false`
- Результат: Сырые данные без изменений

### **Случай 3: Другой канал**
- Интерфейс: `Channel = google`
- Результат: Применяются Google-специфичные преобразования

### **Случай 4: Автоматические настройки**
- Переменные: `ENABLE_TRANSFORMATIONS=true`, `DATA_CHANNEL=meta`
- Интерфейс: оставить по умолчанию
- Результат: Используются настройки из переменных

## 🔍 **5. Проверка результата**

В логах GitHub Actions будет видно:

```
🔄 Applying transformations for channel: meta
🔄 Applying Meta transformations...
✅ Transformed 1500 records
💾 Saved to: data.json
✅ Transformations applied
```

Или:
```
ℹ️  Transformations disabled
```

## 🚀 **6. Добавление нового канала**

1. **В data-transformers репозитории:**
   ```typescript
   // src/transformers/yandex.ts
   export class YandexDataTransformer implements DataTransformer {
     transform(records) { /* логика */ }
   }
   
   // src/registry.ts
   ['yandex', new YandexDataTransformer()]
   ```

2. **В workflow:**
   ```yaml
   options:
     - meta
     - google
     - tiktok
     - yandex  # добавить сюда
   ```

3. **Готово!** Теперь можно выбрать Yandex в интерфейсе
# data-transformers
