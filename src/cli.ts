import fs from 'fs/promises';
import { applyDataTransformations } from './index.js';

async function main() {
	const [inputPath, outputPath, channel] = process.argv.slice(2);

	if (!inputPath || !outputPath || !channel) {
		console.error('Usage: tsx cli.ts <input.json> <output.json> <channel>');
		console.error('Available channels: meta, google, tiktok, noop');
		process.exit(1);
	}

	try {
		console.log(`📊 Transforming ${inputPath} for channel: ${channel}`);

		const rawData = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
		const transformedData = applyDataTransformations(rawData, channel);

		await fs.writeFile(outputPath, JSON.stringify(transformedData, null, 2));

		console.log(`✅ Transformed ${transformedData.length} records`);
		console.log(`💾 Saved to: ${outputPath}`);

	} catch (error) {
		console.error('❌ Transformation failed:', error);
		process.exit(1);
	}
}

main();
