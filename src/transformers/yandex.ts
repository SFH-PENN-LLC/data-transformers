import {DataTransformer} from "../types";
import {DateStandardizer} from "./baseDataTransformer";
import {DataUtils} from "../utils/DataUtils";
import {FieldNormalizer} from "../utils/FieldNormalizer";

/**
 * Yandex трансформер с агрегацией DateStandardizer
 */
export class YandexDataTransformer implements DataTransformer {
	private dateStandardizer: DateStandardizer;
	private shouldCalculateMetrics: boolean;

	constructor() {
		// Настраиваем стандартизатор для Yandex
		this.dateStandardizer = new DateStandardizer({
			preserveRanges: false, // Yandex не использует диапазоны
			deleteOriginalFields: true
		});
		
		// Читаем из переменной окружения, по умолчанию false
		this.shouldCalculateMetrics = process.env.CALCULATE_DERIVED_METRICS === 'true';
	}

	transform(records: Record<string, any>[]): Record<string, any>[] {
		console.log('🔄 Applying Yandex Direct transformations...');

		// 1. Применяем специфичные для Yandex преобразования
		const transformedRecords = records.map(record => this.transformYandexSpecific(record));

		// 2. Применяем стандартизацию дат через агрегацию
		return this.dateStandardizer.standardizeMany(transformedRecords);
	}

	private transformYandexSpecific(record: Record<string, any>): Record<string, any> {
		// Сначала нормализуем все поля из CamelCase в snake_case
		const transformed = FieldNormalizer.normalize(record);

		// Совместимость с Facebook (adset = adgroup)
		if (transformed.ad_group_id) {
			transformed.adset_id = transformed.ad_group_id;
		}
		if (transformed.ad_group_name) {
			transformed.adset_name = transformed.ad_group_name;
		}

		// ===== МЕТРИКИ В ЧИСЛА =====
		const numericFields = ['impressions', 'clicks', 'conversions', 'criterion_id'];
		numericFields.forEach(field => {
			if (transformed[field] !== undefined) {
				transformed[field] = DataUtils.safeNumber(transformed[field]);
			}
		});

		// ===== ФИНАНСОВЫЕ ПОЛЯ (микрорубли → рубли) =====
		const MICROROUBLES_TO_ROUBLES = 1_000_000;
		const financialFields = ['cost', 'avg_cpc', 'avg_cpm', 'cost_per_conversion', 'revenue', 'profit'];

		financialFields.forEach(field => {
			if (transformed[field] !== undefined && transformed[field] !== '') {
				transformed[field] = DataUtils.safeNumber(transformed[field]) / MICROROUBLES_TO_ROUBLES;
			}
		});

		// ===== ПРОЦЕНТНЫЕ ПОЛЯ =====
		const percentageFields = ['ctr', 'conversion_rate', 'impression_share'];
		percentageFields.forEach(field => {
			if (transformed[field] !== undefined && transformed[field] !== '') {
				let value = DataUtils.safeNumber(transformed[field]);
				// Если больше 1, считаем что это проценты
				if (value > 1) {
					value = value / 100;
				}
				transformed[field] = value;
			}
		});

		// ===== УСТРОЙСТВО =====
		if (transformed.device) {
			const deviceMap: Record<string, string> = {
				'DESKTOP': 'desktop',
				'MOBILE': 'mobile',
				'TABLET': 'tablet',
				'TV': 'tv'
			};
			const originalDevice = transformed.device;
			transformed.device = deviceMap[originalDevice] || originalDevice.toLowerCase();
		}

		// ===== МЕТАДАННЫЕ =====
		transformed.data_source = 'yandex_direct';
		transformed.currency = 'RUB';

		// ===== ВЫЧИСЛЯЕМЫЕ МЕТРИКИ =====
		if (this.shouldCalculateMetrics) {
			this.calculateDerivedMetrics(transformed);
		}

		return transformed;
	}

	private calculateDerivedMetrics(record: Record<string, any>): void {
		const cost = record.cost || 0;
		const clicks = record.clicks || 0;
		const impressions = record.impressions || 0;
		const conversions = record.conversions || 0;

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
		const revenue = record.revenue || 0;
		if (revenue > 0 && cost > 0) {
			record.roas = revenue / cost;
			record.roi = ((revenue - cost) / cost) * 100;
		}
	}
}
