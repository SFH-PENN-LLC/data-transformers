import {DataTransformer} from "../types";
import {DateStandardizer} from "./baseDataTransformer";
import {DataUtils} from "../utils/DataUtils";

export class MetaDataTransformer implements DataTransformer {
	private dateStandardizer: DateStandardizer;

	constructor() {
		// Настраиваем для Facebook - сохраняем диапазоны дат
		this.dateStandardizer = new DateStandardizer({
			preserveRanges: true, // Facebook может использовать диапазоны
			deleteOriginalFields: true
		});
	}

	transform(records: Record<string, any>[]): Record<string, any>[] {
		console.log('🔄 Applying Meta/Facebook transformations...');

		const transformedRecords = records.map(record => this.transformMetaSpecific(record));
		return this.dateStandardizer.standardizeMany(transformedRecords);
	}

	private transformMetaSpecific(record: Record<string, any>): Record<string, any> {
		const transformed = { ...record };

		// Разворачиваем actions
		if (Array.isArray(record.actions)) {
			record.actions.forEach((action: any) => {
				if (action.action_type && action.value) {
					transformed[`action_${action.action_type}`] = DataUtils.safeNumber(action.value);
				}
			});
			delete transformed.actions;
		}

		// Разворачиваем conversions
		if (Array.isArray(record.conversions)) {
			record.conversions.forEach((conversion: any) => {
				if (conversion.action_type && conversion.value) {
					transformed[`conversion_${conversion.action_type}`] = DataUtils.safeNumber(conversion.value);
				}
			});
			delete transformed.conversions;
		}

		// Разворачиваем cost_per_action_type
		if (Array.isArray(record.cost_per_action_type)) {
			record.cost_per_action_type.forEach((cpa: any) => {
				if (cpa.action_type && cpa.value) {
					transformed[`cpa_${cpa.action_type}`] = DataUtils.safeNumber(cpa.value);
				}
			});
			delete transformed.cost_per_action_type;
		}

		return transformed;
	}
}
