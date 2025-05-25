import {DataTransformer} from "../types";
import {DateStandardizer} from "./baseDataTransformer";
import {DataUtils} from "../utils/DataUtils";

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
		const transformed = { ...record };

		// Google-специфичные преобразования
		if (record.cost_micros) {
			transformed.spend = DataUtils.safeNumber(record.cost_micros) / 1000000;
			delete transformed.cost_micros;
		}

		return transformed;
	}
}
