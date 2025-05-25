/**
 * Утилиты для работы с данными
 */
export class DataUtils {
	static safeNumber(value: any, defaultValue: number = 0): number {
		if (value === null || value === undefined || value === '') {
			return defaultValue;
		}
		const num = Number(value);
		return isNaN(num) ? defaultValue : num;
	}

	static moveField(record: Record<string, any>, fromField: string, toField: string): void {
		if (record[fromField] !== undefined) {
			record[toField] = record[fromField];
			delete record[fromField];
		}
	}
}
