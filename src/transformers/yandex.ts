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

			// Преобразование метрик в числа
			const numericFields = [
				'Impressions', 'Clicks', 'Cost', 'Conversions',
				'CampaignId', 'AdGroupId', 'AdId', 'CriterionId'
			];

			numericFields.forEach(field => {
				if (record[field] !== undefined && record[field] !== '') {
					transformed[field] = Number(record[field]) || 0;
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

			// Преобразование стоимостных полей (из копеек в рубли, если необходимо)
			const costFields = ['Cost', 'AvgCpc', 'AvgCpm', 'CostPerConversion', 'Revenue'];
			costFields.forEach(field => {
				if (record[field] !== undefined && record[field] !== '') {
					// Yandex Direct возвращает стоимость в рублях с копейками
					transformed[field] = Number(record[field]) || 0;
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

			// Вычисляем дополнительные метрики
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

			return transformed;
		});
	}
}
