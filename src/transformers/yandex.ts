import {DataTransformer} from "../types";
import {DateStandardizer} from "./baseDataTransformer";
import {DataUtils} from "../utils/DataUtils";

/**
 * Yandex трансформер с агрегацией DateStandardizer
 */
export class YandexDataTransformer implements DataTransformer {
	private dateStandardizer: DateStandardizer;

	constructor() {
		// Настраиваем стандартизатор для Yandex
		this.dateStandardizer = new DateStandardizer({
			preserveRanges: false, // Yandex не использует диапазоны
			deleteOriginalFields: true
		});
	}

	transform(records: Record<string, any>[]): Record<string, any>[] {
		console.log('🔄 Applying Yandex Direct transformations...');

		// 1. Применяем специфичные для Yandex преобразования
		const transformedRecords = records.map(record => this.transformYandexSpecific(record));

		// 2. Применяем стандартизацию дат через агрегацию
		return this.dateStandardizer.standardizeMany(transformedRecords);
	}

	private transformYandexSpecific(record: Record<string, any>): Record<string, any> {
		const transformed = { ...record };

		// ===== НОРМАЛИЗАЦИЯ ID И НАЗВАНИЙ =====
		DataUtils.moveField(transformed, 'CampaignId', 'campaign_id');
		DataUtils.moveField(transformed, 'CampaignName', 'campaign_name');
		DataUtils.moveField(transformed, 'AdGroupId', 'adgroup_id');
		DataUtils.moveField(transformed, 'AdGroupName', 'adgroup_name');
		DataUtils.moveField(transformed, 'AdId', 'ad_id');

		// Совместимость с Facebook (adset = adgroup)
		if (transformed.adgroup_id) {
			transformed.adset_id = transformed.adgroup_id;
		}
		if (transformed.adgroup_name) {
			transformed.adset_name = transformed.adgroup_name;
		}

		// ===== МЕТРИКИ В ЧИСЛА =====
		const numericFields = ['Impressions', 'Clicks', 'Conversions', 'CriterionId'];
		numericFields.forEach(field => {
			if (record[field] !== undefined) {
				transformed[field] = DataUtils.safeNumber(record[field]);
			}
		});

		// ===== ФИНАНСОВЫЕ ПОЛЯ (микрорубли → рубли) =====
		const MICROROUBLES_TO_ROUBLES = 1_000_000;
		const financialFields = ['Cost', 'AvgCpc', 'AvgCpm', 'CostPerConversion', 'Revenue', 'Profit'];

		financialFields.forEach(field => {
			if (record[field] !== undefined && record[field] !== '') {
				transformed[field] = DataUtils.safeNumber(record[field]) / MICROROUBLES_TO_ROUBLES;
			}
		});

		// ===== ПРОЦЕНТНЫЕ ПОЛЯ =====
		const percentageFields = ['Ctr', 'ConversionRate', 'ImpressionShare'];
		percentageFields.forEach(field => {
			if (record[field] !== undefined && record[field] !== '') {
				let value = DataUtils.safeNumber(record[field]);
				// Если больше 1, считаем что это проценты
				if (value > 1) {
					value = value / 100;
				}
				transformed[field] = value;
			}
		});

		// ===== УСТРОЙСТВО =====
		if (record.Device) {
			const deviceMap: Record<string, string> = {
				'DESKTOP': 'desktop',
				'MOBILE': 'mobile',
				'TABLET': 'tablet',
				'TV': 'tv'
			};
			transformed.device = deviceMap[record.Device] || record.Device.toLowerCase();
			delete transformed.Device;
		}

		// ===== МЕТАДАННЫЕ =====
		transformed.data_source = 'yandex_direct';
		transformed.currency = 'RUB';

		// ===== ВЫЧИСЛЯЕМЫЕ МЕТРИКИ =====
		this.calculateDerivedMetrics(transformed);

		return transformed;
	}

	private calculateDerivedMetrics(record: Record<string, any>): void {
		const cost = record.Cost || 0;
		const clicks = record.Clicks || 0;
		const impressions = record.Impressions || 0;
		const conversions = record.Conversions || 0;

		if (cost > 0 && clicks > 0) {
			record.avg_cpc = cost / clicks;
		}
		if (cost > 0 && impressions > 0) {
			record.avg_cpm = (cost / impressions) * 1000;
		}
		if (clicks > 0 && impressions > 0) {
			record.ctr = clicks / impressions;
		}
		if (conversions > 0 && clicks > 0) {
			record.conversion_rate = conversions / clicks;
		}
		if (cost > 0 && conversions > 0) {
			record.cost_per_conversion = cost / conversions;
		}

		// ROI и ROAS
		const revenue = record.Revenue || 0;
		if (revenue > 0 && cost > 0) {
			record.roas = revenue / cost;
			record.roi = ((revenue - cost) / cost) * 100;
		}
	}
}
