import { DataTransformer } from '../types.js';

export class GoogleDataTransformer implements DataTransformer {
	transform(records: Record<string, any>[]): Record<string, any>[] {
		console.log('🔄 Applying Google transformations...');

		return records.map(record => {
			const transformed = { ...record };

			// Google-специфичные преобразования
			if (record.cost_micros) {
				transformed.spend = Number(record.cost_micros) / 1000000;
				delete transformed.cost_micros;
			}

			return transformed;
		});
	}
}
