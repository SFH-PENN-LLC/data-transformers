# Универсальный маппинг полей сегментации

**Дата внедрения**: 2025-06-29  
**Версия API**: Яндекс.Директ API v5 (2025-01)  
**Статус**: Реализовано

## Описание нововведения

В трансформере Яндекс.Директ реализован полный (100%) маппинг всех полей сегментации для обеспечения универсальной работы с динамическими уникальными ключами в базе данных.

## Проблема

1. **Разнородность полей**: Разные рекламные платформы используют различные названия для одних и тех же полей сегментации
2. **Динамические ключи БД**: DB-Writer должен автоматически определять поля для построения уникальных индексов
3. **Масштабируемость**: При добавлении новых полей сегментации нужно избегать изменений в DB-Writer

## Решение

Универсальный маппинг полей сегментации встроен в трансформер после этапа нормализации CamelCase → snake_case, но до обработки метрик.

### Архитектура решения

```
Входящие данные (Yandex API)
    ↓
FieldNormalizer (CamelCase → snake_case)
    ↓
✨ МАППИНГ ПОЛЕЙ СЕГМЕНТАЦИИ (новое)
    ↓
Обработка метрик и финансов
    ↓
Стандартизированные данные для DB-Writer
```

## Категории маппинга полей

### 1. Устройства и платформы
- `device_type` → `device`
- `mobile_platform` → `mobile_platform` (Android/iOS/Other)
- `carrier_type` → `carrier_type` (CELLULAR/STATIONARY)

### 2. Демография
- `gender_type` → `gender` (MALE/FEMALE/UNKNOWN)
- `age_group` → `age` (AGE_18_24, AGE_25_34, etc.)
- `income_grade` → `income_grade` (VERY_HIGH/HIGH/ABOVE_AVERAGE/OTHER)

### 3. География
- `location_of_presence_id` → `location_of_presence_id`
- `location_of_presence_name` → `location_of_presence_name`
- `targeting_location_id` → `targeting_location_id`
- `targeting_location_name` → `targeting_location_name`

### 4. Размещения и форматы
- `ad_format` → `ad_format` (TEXT/IMAGE/VIDEO/SMART_*)
- `ad_network_type` → `ad_network_type` (SEARCH/AD_NETWORK)
- `slot` → `slot` (PREMIUMBLOCK/SUGGEST/etc.)
- `placement` → `placement`
- `external_network_name` → `external_network_name`
- `click_type` → `click_type` (TITLE/SITELINK*/VCARD/etc.)

### 5. Критерии и таргетинг
- `criterion` → `criterion`
- `criterion_id` → `criterion_id`
- `criterion_type` → `criterion_type`
- `match_type` → `match_type`
- `matched_keyword` → `matched_keyword`
- `query` → `query`
- `keyword` → `keyword`
- `targeting_category` → `targeting_category`

### 6. Аудитории и ретаргетинг
- `audience_target_id` → `audience_target_id`
- `rl_adjustment_id` → `rl_adjustment_id`
- `dynamic_text_ad_target_id` → `dynamic_text_ad_target_id`
- `smart_ad_target_id` → `smart_ad_target_id`

### 7. Типы кампаний
- `campaign_type` → `campaign_type`
- `campaign_url_path` → `campaign_url_path`

### 8. Временные измерения
- `hour_of_day` → `hour_of_day`
- `day_of_week` → `day_of_week`
- `week` → `week`
- `month` → `month`
- `quarter` → `quarter`
- `year` → `year`

### 9. Видео сегментация
- `video_complete` → `video_complete`
- `video_complete_rate` → `video_complete_rate`
- `video_first_quartile` → `video_first_quartile`
- `video_midpoint` → `video_midpoint`
- `video_third_quartile` → `video_third_quartile`
- Все остальные видео метрики...

## Преимущества реализации

1. **100% покрытие**: Все поля из Яндекс.Директ API v5 учтены
2. **Универсальность**: DB-Writer получает стандартизированные названия
3. **Производительность**: Маппинг происходит один раз на уровне трансформера
4. **Расширяемость**: Легко добавить новые поля без изменения DB-Writer
5. **Совместимость**: Существующие интеграции продолжают работать

## Пример работы

### Входящие данные от Яндекс API:
```json
{
  "Date": "2025-06-03",
  "CampaignId": "700821495",
  "DeviceType": "MOBILE",
  "GenderType": "MALE",
  "LocationOfPresenceId": "213",
  "AdNetworkType": "SEARCH",
  "IncomeGrade": "HIGH"
}
```

### После трансформации:
```json
{
  "date": "2025-06-03",
  "campaign_id": "700821495",
  "device": "mobile",
  "gender": "MALE",
  "location_of_presence_id": "213",
  "ad_network_type": "SEARCH",
  "income_grade": "HIGH",
  "data_source": "yandex_direct",
  "currency": "RUB"
}
```

## Интеграция с DB-Writer

DB-Writer теперь может использовать стандартные поля для автоматического построения уникальных ключей:

```sql
CREATE UNIQUE INDEX campaign_data_unique_idx ON campaign_data (
  date,
  campaign_id,
  data_source,
  -- Динамически добавляемые поля сегментации:
  device,
  gender,
  location_of_presence_id,
  ad_network_type,
  income_grade
);
```

## Обратная совместимость

- Все существующие поля продолжают работать
- Базовые метрики (impressions, clicks, cost) не затронуты
- Добавлены только новые маппинги без изменения существующих

## Версионность

- **API версия**: Яндекс.Директ API v5
- **Дата спецификации**: 2025-01
- **Версия трансформера**: 2.0.0
- **Обратная совместимость**: Полная