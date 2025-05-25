/**
 * Сервис стандартизации полей дат
 * Используется через агрегацию, а не наследование
 */
export interface DateStandardizerConfig {
	preserveRanges?: boolean; // Сохранять date_start/date_stop если они разные
	deleteOriginalFields?: boolean; // Удалять исходные поля после стандартизации
}

export class DateStandardizer {
	private config: DateStandardizerConfig;

	constructor(config: DateStandardizerConfig = {}) {
		this.config = {
			preserveRanges: true,
			deleteOriginalFields: true,
			...config
		};
	}

	/**
	 * Стандартизирует поля дат в записи
	 */
	standardize(record: Record<string, any>): Record<string, any> {
		const result = { ...record };

		// Список возможных полей дат (в порядке приоритета)
		const possibleDateFields = [
			'date',       // уже стандартное
			'Date',       // Yandex
			'date_start', // Facebook
			'day',        // альтернативное
			'date_stop'   // последний приоритет
		];

		let dateValue: string | null = null;
		let foundField: string | null = null;

		// Ищем первое доступное поле даты
		for (const field of possibleDateFields) {
			if (result[field] && !dateValue) {
				dateValue = String(result[field]);
				foundField = field;
				break;
			}
		}

		if (dateValue && foundField) {
			// Устанавливаем стандартное поле
			result.date = dateValue;

			// Логика удаления дублей
			this.cleanupDateFields(result, possibleDateFields);
		}

		return result;
	}

	/**
	 * Стандартизирует массив записей
	 */
	standardizeMany(records: Record<string, any>[]): Record<string, any>[] {
		return records.map(record => this.standardize(record));
	}

	/**
	 * Удаляет дублирующие поля дат
	 */
	private cleanupDateFields(record: Record<string, any>, dateFields: string[]): void {
		if (!this.config.deleteOriginalFields) {
			return;
		}

		dateFields.forEach(field => {
			if (field === 'date') {
				return; // Оставляем стандартное поле
			}

			// Специальная логика для Facebook диапазонов
			if (this.config.preserveRanges &&
				(field === 'date_start' || field === 'date_stop')) {

				const dateStart = record.date_start;
				const dateStop = record.date_stop;

				// Если диапазон (разные даты) - сохраняем
				if (dateStart && dateStop && dateStart !== dateStop) {
					return;
				}
			}

			// Удаляем поле если оно есть
			if (record[field] !== undefined) {
				delete record[field];
			}
		});
	}

	/**
	 * Проверяет, есть ли в записи поля дат
	 */
	hasDateFields(record: Record<string, any>): boolean {
		const dateFields = ['date', 'Date', 'date_start', 'day', 'date_stop'];
		return dateFields.some(field => record[field] !== undefined);
	}

	/**
	 * Извлекает значение даты из записи
	 */
	extractDate(record: Record<string, any>): string | null {
		const dateFields = ['date', 'Date', 'date_start', 'day', 'date_stop'];

		for (const field of dateFields) {
			if (record[field]) {
				return String(record[field]);
			}
		}

		return null;
	}
}
