import {DataTransformer} from "../types";
import {DateStandardizer} from "./baseDataTransformer";
import {DataUtils} from "../utils/DataUtils";
import {FieldNormalizer} from "../utils/FieldNormalizer";

/**
 * Google трансформер с агрегацией
 */
export class GoogleDataTransformer implements DataTransformer {
	private dateStandardizer: DateStandardizer;

	constructor() {
		this.dateStandardizer = new DateStandardizer({
			preserveRanges: false,
			deleteOriginalFields: true
		});
	}

	transform(records: Record<string, any>[]): Record<string, any>[] {
		console.log('🔄 Applying Google Ads transformations...');

		const transformedRecords = records.map(record => this.transformGoogleSpecific(record));
		return this.dateStandardizer.standardizeMany(transformedRecords);
	}

	private transformGoogleSpecific(record: Record<string, any>): Record<string, any> {
		// Сначала нормализуем все поля из CamelCase в snake_case
		const transformed = FieldNormalizer.normalize(record);

		// ===== ФИНАНСОВЫЕ ПОЛЯ (микроединицы → основные единицы) =====
		const MICROS_TO_MAIN = 1_000_000;
		const microFields = ['cost_micros', 'average_cpc_micros', 'average_cpm_micros'];
		
		microFields.forEach(microField => {
			if (transformed[microField] !== undefined) {
				const baseField = microField.replace('_micros', '');
				// cost_micros → cost, average_cpc_micros → average_cpc
				transformed[baseField] = DataUtils.safeNumber(transformed[microField]) / MICROS_TO_MAIN;
				delete transformed[microField];
			}
		});

		// Google Ads API возвращает cost_micros, преобразуем в cost для унификации с другими платформами

		// ===== МЕТРИКИ В ЧИСЛА =====
		const numericFields = ['impressions', 'clicks', 'conversions'];
		numericFields.forEach(field => {
			if (transformed[field] !== undefined) {
				transformed[field] = DataUtils.safeNumber(transformed[field]);
			}
		});

		// ===== МЕТАДАННЫЕ =====
		transformed.data_source = 'google_ads';
		transformed.currency = 'USD'; // По умолчанию, может настраиваться

		return transformed;
	}
}
