import {DataTransformer} from "../types";
import {DateStandardizer} from "./baseDataTransformer";

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
		const transformed = { ...record };

		// TikTok-специфичные преобразования добавить при необходимости

		return transformed;
	}
}
