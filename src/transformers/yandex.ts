import { DataTransformer } from '../types.js';

export class YandexDataTransformer implements DataTransformer {
	transform(records: Record<string, any>[]): Record<string, any>[] {
		console.log('🔄 Applying Yandex Direct transformations...');

		return records.map(record => {
			const transformed = { ...record };

			// Нормализация полей дат
			if (record.Date) {
				transformed.date = record.Date;
				transformed.date_start = record.Date;
				transformed.date_stop = record.Date;
			}

			// Нормализация ID кампании
			if (record.CampaignId) {
				transformed.campaign_id = record.CampaignId;
			}

			if (record.CampaignName) {
				transformed.campaign_name = record.CampaignName;
			}

			// Нормализация ID группы объявлений
			if (record.AdGroupId) {
				transformed.adset_id = record.AdGroupId; // Мапим на adset для совместимости
				transformed.adgroup_id = record.AdGroupId;
			}

			if (record.AdGroupName) {
				transformed.adset_name = record.AdGroupName;
				transformed.adgroup_name = record.AdGroupName;
			}

			// Нормализация ID объявления
			if (record.AdId) {
				transformed.ad_id = record.AdId;
			}

			// Преобразование метрик в числа (НЕ финансовых)
			const numericFields = [
				'Impressions', 'Clicks', 'Conversions',
				'CampaignId', 'AdGroupId', 'AdId', 'CriterionId'
			];

			numericFields.forEach(field => {
				if (record[field] !== undefined && record[field] !== '') {
					transformed[field] = Number(record[field]) || 0;
				}
			});

			// ===== ФИНАНСОВЫЕ ПОЛЯ - КОНВЕРТАЦИЯ ИЗ МИКРОРУБЛЕЙ В РУБЛИ =====
			// Источник: https://yandex.ru/dev/direct/doc/ref-v5/dictionaries/get-docpage/
			// 1 рубль = 1,000,000 микрорублей
			const MICROROUBLES_TO_ROUBLES = 1_000_000;

			const financialFields = [
				'Cost',           // общая стоимость
				'AvgCpc',         // средняя цена за клик
				'AvgCpm',         // средняя цена за тысячу показов
				'CostPerConversion', // стоимость конверсии
				'Revenue',        // доход/выручка
				'Profit'          // прибыль (добавлено в changelog API v5)
			];

			financialFields.forEach(field => {
				if (record[field] !== undefined && record[field] !== '') {
					const microroubleValue = Number(record[field]);
					if (!isNaN(microroubleValue)) {
						// Конвертируем из микрорублей в рубли
						transformed[field] = microroubleValue / MICROROUBLES_TO_ROUBLES;
					} else {
						transformed[field] = 0;
					}
				}
			});

			// Преобразование процентных полей
			const percentageFields = ['Ctr', 'ConversionRate', 'ImpressionShare'];
			percentageFields.forEach(field => {
				if (record[field] !== undefined && record[field] !== '') {
					// Если значение уже в десятичном формате (0.05), оставляем как есть
					// Если в процентном (5%), преобразуем в десятичный
					let value = Number(record[field]);
					if (!isNaN(value) && value > 1) {
						value = value / 100; // Преобразуем проценты в десятичную дробь
					}
					transformed[field] = value;
				}
			});

			// Нормализация устройства
			if (record.Device) {
				// Приводим к стандартному формату
				const deviceMap: Record<string, string> = {
					'DESKTOP': 'desktop',
					'MOBILE': 'mobile',
					'TABLET': 'tablet',
					'TV': 'tv'
				};
				transformed.device = deviceMap[record.Device] || record.Device.toLowerCase();
			}

			// Добавляем источник данных
			transformed.data_source = 'yandex_direct';

			// Добавляем информацию о валюте
			transformed.currency = 'RUB';

			// Вычисляем дополнительные метрики (уже в рублях)
			if (transformed.Cost && transformed.Clicks && transformed.Clicks > 0) {
				transformed.avg_cpc = transformed.Cost / transformed.Clicks;
			}

			if (transformed.Cost && transformed.Impressions && transformed.Impressions > 0) {
				transformed.avg_cpm = (transformed.Cost / transformed.Impressions) * 1000;
			}

			if (transformed.Clicks && transformed.Impressions && transformed.Impressions > 0) {
				transformed.ctr = transformed.Clicks / transformed.Impressions;
			}

			if (transformed.Conversions && transformed.Clicks && transformed.Clicks > 0) {
				transformed.conversion_rate = transformed.Conversions / transformed.Clicks;
			}

			if (transformed.Cost && transformed.Conversions && transformed.Conversions > 0) {
				transformed.cost_per_conversion = transformed.Cost / transformed.Conversions;
			}

			// ROI и ROAS расчеты (если есть Revenue)
			if (transformed.Revenue && transformed.Cost && transformed.Cost > 0) {
				transformed.roas = transformed.Revenue / transformed.Cost; // Return on Ad Spend
				transformed.roi = ((transformed.Revenue - transformed.Cost) / transformed.Cost) * 100; // ROI в процентах
			}

			return transformed;
		});
	}
}
