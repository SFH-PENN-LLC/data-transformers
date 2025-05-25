import { DataTransformer } from './types.js';
import {MetaDataTransformer} from "./transformers/meta";
import {GoogleDataTransformer} from "./transformers/google";
import {YandexDataTransformer} from "./transformers/yandex";
import {NoOpTransformer} from "./transformers/base";
import {TikTokDataTransformer} from "./transformers/tiktok";


export class TransformerRegistry {
	private static transformers = new Map<string, DataTransformer>([
		['meta', new MetaDataTransformer()],
		['facebook', new MetaDataTransformer()], // алиас
		['google', new GoogleDataTransformer()],
		['tiktok', new TikTokDataTransformer()],
		['yandex', new YandexDataTransformer()],
		['yandex_direct', new YandexDataTransformer()], // алиас
		['noop', new NoOpTransformer()]
	]);

	static get(channel: string): DataTransformer {
		const transformer = this.transformers.get(channel.toLowerCase());
		if (!transformer) {
			console.warn(`⚠️  No transformer for channel '${channel}', using NoOp with date standardization`);
			return this.transformers.get('noop')!;
		}
		return transformer;
	}

	static register(channel: string, transformer: DataTransformer): void {
		this.transformers.set(channel.toLowerCase(), transformer);
		console.log(`✅ Registered transformer for channel: ${channel}`);
	}

	static getAvailableChannels(): string[] {
		return Array.from(this.transformers.keys()).filter(key => key !== 'noop');
	}

	/**
	 * Информация об архитектуре с агрегацией
	 */
	static getArchitectureInfo(): string {
		return `
📐 ARCHITECTURE INFO:
- Date standardization via AGGREGATION (not inheritance)
- Each transformer uses DateStandardizer service
- Single Responsibility Principle: transformers focus on their data, DateStandardizer handles dates
- Easy testing: can mock DateStandardizer independently
- Flexible configuration: different standardization rules per transformer
- New transformers automatically get date standardization by using DateStandardizer
		`.trim();
	}
}
