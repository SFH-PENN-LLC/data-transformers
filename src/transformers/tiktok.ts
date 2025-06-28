import {DataTransformer} from "../types";
import {DateStandardizer} from "./baseDataTransformer";
import {FieldNormalizer} from "../utils/FieldNormalizer";

/**
 * TikTok трансформер с агрегацией
 */
export class TikTokDataTransformer implements DataTransformer {
	private dateStandardizer: DateStandardizer;

	constructor() {
		this.dateStandardizer = new DateStandardizer();
	}

	transform(records: Record<string, any>[]): Record<string, any>[] {
		console.log('🔄 Applying TikTok transformations...');

		const transformedRecords = records.map(record => this.transformTikTokSpecific(record));
		return this.dateStandardizer.standardizeMany(transformedRecords);
	}

	private transformTikTokSpecific(record: Record<string, any>): Record<string, any> {
		// Нормализуем все поля из CamelCase в snake_case
		const transformed = FieldNormalizer.normalize(record);

		// ===== МЕТАДАННЫЕ =====
		transformed.data_source = 'tiktok';
		transformed.currency = 'USD'; // По умолчанию

		// TikTok-специфичные преобразования добавить при необходимости

		return transformed;
	}
}
