import { TransformerRegistry } from './registry.js';

export function applyDataTransformations(
	records: Record<string, any>[],
	channel: string
): Record<string, any>[] {
	const transformer = TransformerRegistry.get(channel);
	return transformer.transform(records);
}

export { TransformerRegistry };
export * from './types.js';
