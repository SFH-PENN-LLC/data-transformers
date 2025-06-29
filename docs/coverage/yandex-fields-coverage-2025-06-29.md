# Покрытие полей Яндекс.Директ

**Дата проверки**: 2025-06-29  
**Версия API**: Яндекс.Директ API v5 (2025-01)  
**Процент покрытия**: 100%  
**Статус**: ✅ Полное покрытие

## Сводка

- **Всего полей в API**: 85
- **Метрики**: 29 (не требуют маппинга)
- **Идентификаторы**: 7 (не требуют маппинга)
- **Поля сегментации**: 49
- **Покрыто маппингом**: 49 (100%)

## Маппинг полей сегментации

### Устройства и платформы (3 поля)
| Поле API | После нормализации | Стандартное поле |
|----------|-------------------|------------------|
| Device | device | device |
| MobilePlatform | mobile_platform | mobile_platform |
| CarrierType | carrier_type | carrier_type |

### Демография (3 поля)
| Поле API | После нормализации | Стандартное поле |
|----------|-------------------|------------------|
| Gender | gender | gender |
| Age | age | age |
| IncomeGrade | income_grade | income_grade |

### География (4 поля)
| Поле API | После нормализации | Стандартное поле |
|----------|-------------------|------------------|
| LocationOfPresenceId | location_of_presence_id | location_of_presence_id |
| LocationOfPresenceName | location_of_presence_name | location_of_presence_name |
| TargetingLocationId | targeting_location_id | targeting_location_id |
| TargetingLocationName | targeting_location_name | targeting_location_name |

### Размещения и форматы (6 полей)
| Поле API | После нормализации | Стандартное поле |
|----------|-------------------|------------------|
| AdFormat | ad_format | ad_format |
| AdNetworkType | ad_network_type | ad_network_type |
| Slot | slot | slot |
| Placement | placement | placement |
| ExternalNetworkName | external_network_name | external_network_name |
| ClickType | click_type | click_type |

### Критерии и таргетинг (11 полей)
| Поле API | После нормализации | Стандартное поле |
|----------|-------------------|------------------|
| Criterion | criterion | criterion |
| CriterionId | criterion_id | criterion_id |
| CriterionType | criterion_type | criterion_type |
| Criteria | criteria | criteria |
| CriteriaId | criteria_id | criteria_id |
| CriteriaType | criteria_type | criteria_type |
| MatchType | match_type | match_type |
| MatchedKeyword | matched_keyword | matched_keyword |
| Query | query | query |
| Keyword | keyword | keyword |
| TargetingCategory | targeting_category | targeting_category |

### Аудитории и ретаргетинг (4 поля)
| Поле API | После нормализации | Стандартное поле |
|----------|-------------------|------------------|
| AudienceTargetId | audience_target_id | audience_target_id |
| RlAdjustmentId | rl_adjustment_id | rl_adjustment_id |
| DynamicTextAdTargetId | dynamic_text_ad_target_id | dynamic_text_ad_target_id |
| SmartAdTargetId | smart_ad_target_id | smart_ad_target_id |

### Типы кампаний (2 поля)
| Поле API | После нормализации | Стандартное поле |
|----------|-------------------|------------------|
| CampaignType | campaign_type | campaign_type |
| CampaignUrlPath | campaign_url_path | campaign_url_path |

### Временные измерения (6 полей)
| Поле API | После нормализации | Стандартное поле |
|----------|-------------------|------------------|
| HourOfDay | hour_of_day | hour_of_day |
| DayOfWeek | day_of_week | day_of_week |
| Week | week | week |
| Month | month | month |
| Quarter | quarter | quarter |
| Year | year | year |

### Видео сегментация (10 полей)
| Поле API | После нормализации | Стандартное поле |
|----------|-------------------|------------------|
| VideoComplete | video_complete | video_complete |
| VideoCompleteRate | video_complete_rate | video_complete_rate |
| VideoFirstQuartile | video_first_quartile | video_first_quartile |
| VideoFirstQuartileRate | video_first_quartile_rate | video_first_quartile_rate |
| VideoMidpoint | video_midpoint | video_midpoint |
| VideoMidpointRate | video_midpoint_rate | video_midpoint_rate |
| VideoThirdQuartile | video_third_quartile | video_third_quartile |
| VideoThirdQuartileRate | video_third_quartile_rate | video_third_quartile_rate |
| VideoViews | video_views | video_views |
| VideoViewsRate | video_views_rate | video_views_rate |

## Неподдерживаемые поля

Нет - все поля сегментации полностью покрыты.

## Примечания

1. Некоторые поля имеют двойной маппинг для обратной совместимости:
   - `device` и `device_type` → `device`
   - `gender` и `gender_type` → `gender`
   - `age` и `age_group` → `age`

2. Поля метрик не требуют маппинга и обрабатываются отдельно в трансформере

3. Финансовые поля автоматически конвертируются из микрорублей в рубли

## Валидация

Автоматический тест покрытия: `test/test-yandex-full-coverage.js`  
Результат последнего теста: ✅ 100% покрытие