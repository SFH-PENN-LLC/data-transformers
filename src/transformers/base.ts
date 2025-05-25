import {DataTransformer} from "../types";
import {DateStandardizer} from "./baseDataTransformer";

/**
 * NoOp трансформер с агрегацией
 */
export class NoOpTransformer implements DataTransformer {
	private dateStandardizer: DateStandardizer;

	constructor() {
		this.dateStandardizer = new DateStandardizer();
	}

	transform(records: Record<string, any>[]): Record<string, any>[] {
		console.log('ℹ️  Applying date standardization only...');

		// Только стандартизация дат, никаких других преобразований
		return this.dateStandardizer.standardizeMany(records);
	}
}
