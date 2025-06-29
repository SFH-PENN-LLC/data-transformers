# Инструкция по добавлению полей сегментации для новых платформ

**Версия**: 1.0.0  
**Дата создания**: 2025-06-29  
**Актуально для**: data-transformers v2.0+

## Обзор процесса

При интеграции новой рекламной платформы необходимо обеспечить 100% покрытие всех полей сегментации для корректной работы динамических уникальных ключей в БД.

## Пошаговая инструкция

### Шаг 1: Анализ API документации платформы

1. **Получите актуальную документацию API**
   - Версия API
   - Дата релиза
   - Список всех доступных полей в отчетах

2. **Создайте полный список полей**
   ```markdown
   # Поля [Название платформы] API [версия]
   
   ## Метрики
   - impressions
   - clicks
   - cost
   ...
   
   ## Измерения (dimensions)
   - campaign_id
   - device_type
   - gender
   ...
   
   ## Сегментация
   - age_group
   - location
   ...
   ```

### Шаг 2: Категоризация полей

Разделите все поля на категории:

1. **Базовые метрики** (не требуют маппинга)
   - impressions, clicks, cost, conversions, revenue

2. **Идентификаторы** (обычно сохраняют названия)
   - campaign_id, ad_id, adgroup_id

3. **Поля сегментации** (требуют маппинга)
   - Устройства и платформы
   - Демография
   - География
   - Размещения
   - Временные измерения
   - Специфичные для платформы

### Шаг 3: Создание маппинга

1. **Создайте новый трансформер** (если еще нет)
   ```typescript
   // src/transformers/[platform].ts
   export class [Platform]DataTransformer implements DataTransformer {
     // ...
   }
   ```

2. **Добавьте маппинг полей сегментации**
   ```typescript
   const segmentationMapping: Record<string, string> = {
     // === УСТРОЙСТВА И ПЛАТФОРМЫ ===
     '[platform_device_field]': 'device',
     '[platform_os_field]': 'mobile_platform',
     
     // === ДЕМОГРАФИЯ ===
     '[platform_gender_field]': 'gender',
     '[platform_age_field]': 'age',
     
     // === ГЕОГРАФИЯ ===
     '[platform_location_field]': 'location_id',
     
     // ... остальные категории
   };
   ```

### Шаг 4: Стандартизация значений

Приведите значения к единому формату:

```typescript
// Пример для устройств
if (transformed.device) {
  const deviceMap: Record<string, string> = {
    'DESKTOP_COMPUTER': 'desktop',
    'SMARTPHONE': 'mobile',
    'TABLET_DEVICE': 'tablet'
  };
  transformed.device = deviceMap[transformed.device] || transformed.device.toLowerCase();
}
```

### Шаг 5: Тестирование покрытия

1. **Создайте тестовый файл**
   ```javascript
   // test/test-[platform]-segmentation-coverage.js
   ```

2. **Проверьте все поля из документации**
   ```javascript
   const PLATFORM_API_FIELDS = [
     // Полный список из документации
   ];
   
   const MAPPED_FIELDS = Object.keys(segmentationMapping);
   
   // Проверка покрытия
   const uncoveredFields = PLATFORM_API_FIELDS.filter(
     field => !MAPPED_FIELDS.includes(field) && !METRIC_FIELDS.includes(field)
   );
   ```

### Шаг 6: Документирование

1. **Создайте документ покрытия**
   ```markdown
   docs/coverage/[platform]-fields-coverage-[date].md
   ```

2. **Укажите обязательную информацию**:
   - Дата проверки
   - Версия API платформы
   - Процент покрытия
   - Список всех полей с маппингом
   - Неподдерживаемые поля (если есть)

## Чек-лист для новой платформы

- [ ] Получена актуальная документация API
- [ ] Создан полный список полей
- [ ] Поля категоризированы
- [ ] Создан трансформер с маппингом
- [ ] Добавлена стандартизация значений
- [ ] Написан тест покрытия
- [ ] Тест показывает 100% покрытие
- [ ] Создан документ покрытия
- [ ] Обновлен главный README

## Пример: Google Ads

### 1. Анализ полей Google Ads API v15
```
device.type → device
demographic.gender → gender
demographic.age_range → age
geographic.metro → location_id
ad_network_type → ad_network_type
```

### 2. Маппинг в трансформере
```typescript
const segmentationMapping: Record<string, string> = {
  'device_type': 'device',
  'demographic_gender': 'gender',
  'demographic_age_range': 'age',
  'geographic_metro': 'location_id',
  'ad_network_type': 'ad_network_type'
};
```

### 3. Документ покрытия
```markdown
# Google Ads Fields Coverage
**Date**: 2025-06-29
**API Version**: Google Ads API v15
**Coverage**: 100%

## Mapped Fields
- device.type → device
- demographic.gender → gender
...
```

## Стандартные названия полей

Используйте эти стандартные названия для единообразия:

### Основные
- `device` - тип устройства
- `gender` - пол
- `age` - возрастная группа
- `location_id` - ID локации
- `location_name` - название локации

### Размещения
- `ad_network_type` - тип сети
- `placement` - площадка
- `ad_format` - формат объявления
- `slot` - блок размещения

### Таргетинг
- `audience_id` - ID аудитории
- `keyword` - ключевое слово
- `search_term` - поисковый запрос
- `match_type` - тип соответствия

### Время
- `hour_of_day` - час дня
- `day_of_week` - день недели
- `month` - месяц
- `quarter` - квартал
- `year` - год

## Контроль качества

1. **Автоматическая проверка**
   ```bash
   npm run test:coverage:[platform]
   ```

2. **Ревью кода**
   - Проверка полноты маппинга
   - Соответствие стандартам
   - Корректность документации

3. **Интеграционное тестирование**
   - Проверка с реальными данными
   - Валидация уникальных ключей БД

## Поддержка

При возникновении вопросов:
1. Изучите существующие трансформеры (yandex.ts, google.ts)
2. Проверьте документацию в папке docs/coverage/
3. Обратитесь к команде разработки