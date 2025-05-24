import { DataTransformer } from '../types.js';

export class MetaDataTransformer implements DataTransformer {
	transform(records: Record<string, any>[]): Record<string, any>[] {
		console.log('🔄 Applying Meta transformations...');

		return records.map(record => {
			const transformed = { ...record };

			// Разворачиваем actions
			if (Array.isArray(record.actions)) {
				record.actions.forEach((action: any) => {
					if (action.action_type && action.value) {
						transformed[`action_${action.action_type}`] = Number(action.value) || action.value;
					}
				});
				delete transformed.actions;
			}

			// Разворачиваем conversions
			if (Array.isArray(record.conversions)) {
				record.conversions.forEach((conversion: any) => {
					if (conversion.action_type && conversion.value) {
						transformed[`conversion_${conversion.action_type}`] = Number(conversion.value) || conversion.value;
					}
				});
				delete transformed.conversions;
			}

			// Разворачиваем cost_per_action_type
			if (Array.isArray(record.cost_per_action_type)) {
				record.cost_per_action_type.forEach((cpa: any) => {
					if (cpa.action_type && cpa.value) {
						transformed[`cpa_${cpa.action_type}`] = Number(cpa.value) || cpa.value;
					}
				});
				delete transformed.cost_per_action_type;
			}

			return transformed;
		});
	}
}
