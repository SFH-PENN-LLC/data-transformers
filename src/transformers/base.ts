import { DataTransformer } from '../types.js';

export class NoOpTransformer implements DataTransformer {
	transform(records: Record<string, any>[]): Record<string, any>[] {
		console.log('ℹ️  No transformations applied');
		return records;
	}
}
