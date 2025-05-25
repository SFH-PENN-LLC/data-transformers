import { DataTransformer } from './types.js';
import { NoOpTransformer } from './transformers/base.js';
import { MetaDataTransformer } from './transformers/meta.js';
import { GoogleDataTransformer } from './transformers/google.js';
import { TikTokDataTransformer } from './transformers/tiktok.js';
import { YandexDataTransformer } from './transformers/yandex.js';

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
			console.warn(`⚠️  No transformer for channel '${channel}', using NoOp`);
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
}
