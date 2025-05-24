export interface DataTransformer {
	transform(records: Record<string, any>[]): Record<string, any>[];
}
