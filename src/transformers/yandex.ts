import {DataTransformer} from "../types";
import {DateStandardizer} from "./baseDataTransformer";
import {DataUtils} from "../utils/DataUtils";
import {FieldNormalizer} from "../utils/FieldNormalizer";

/**
 * Yandex трансформер с агрегацией DateStandardizer
 */
export class YandexDataTransformer implements DataTransformer {
	private dateStandardizer: DateStandardizer;
	private shouldCalculateMetrics: boolean;

	constructor() {
		// Настраиваем стандартизатор для Yandex
		this.dateStandardizer = new DateStandardizer({
			preserveRanges: false, // Yandex не использует диапазоны
			deleteOriginalFields: true
		});
		
		// Читаем из переменной окружения, по умолчанию false
		this.shouldCalculateMetrics = process.env.CALCULATE_DERIVED_METRICS === 'true';
	}

	transform(records: Record<string, any>[]): Record<string, any>[] {
		console.log('🔄 Applying Yandex Direct transformations...');

		// 1. Применяем специфичные для Yandex преобразования
		const transformedRecords = records.map(record => this.transformYandexSpecific(record));

		// 2. Применяем стандартизацию дат через агрегацию
		return this.dateStandardizer.standardizeMany(transformedRecords);
	}

	private transformYandexSpecific(record: Record<string, any>): Record<string, any> {
		// Сначала нормализуем все поля из CamelCase в snake_case
		const transformed = FieldNormalizer.normalize(record);

		// ===== МАППИНГ ПОЛЕЙ СЕГМЕНТАЦИИ =====
		// Стандартизируем названия полей сегментации для универсального детектора
		// 100% покрытие всех полей Яндекс.Директ API v5 (версия 2025-01)
		const segmentationMapping: Record<string, string> = {
			// === УСТРОЙСТВА И ПЛАТФОРМЫ ===
			'device': 'device',
			'device_type': 'device',
			'mobile_platform': 'mobile_platform',
			'carrier_type': 'carrier_type',
			
			// === ДЕМОГРАФИЯ ===
			'gender': 'gender',
			'gender_type': 'gender',
			'age': 'age',
			'age_group': 'age',
			'income_grade': 'income_grade',
			
			// === ГЕОГРАФИЯ ===
			'location_of_presence_id': 'location_of_presence_id',
			'location_of_presence_name': 'location_of_presence_name',
			'targeting_location_id': 'targeting_location_id',
			'targeting_location_name': 'targeting_location_name',
			
			// === РАЗМЕЩЕНИЯ И ФОРМАТЫ ===
			'ad_format': 'ad_format',
			'ad_network_type': 'ad_network_type',
			'slot': 'slot',
			'placement': 'placement',
			'external_network_name': 'external_network_name',
			'click_type': 'click_type',
			
			// === КРИТЕРИИ И ТАРГЕТИНГ ===
			'criterion': 'criterion',
			'criterion_id': 'criterion_id',
			'criterion_type': 'criterion_type',
			'criteria': 'criteria',
			'criteria_id': 'criteria_id',
			'criteria_type': 'criteria_type',
			'match_type': 'match_type',
			'matched_keyword': 'matched_keyword',
			'query': 'query',
			'keyword': 'keyword',
			'targeting_category': 'targeting_category',
			
			// === АУДИТОРИИ И РЕТАРГЕТИНГ ===
			'audience_target_id': 'audience_target_id',
			'rl_adjustment_id': 'rl_adjustment_id',
			'dynamic_text_ad_target_id': 'dynamic_text_ad_target_id',
			'smart_ad_target_id': 'smart_ad_target_id',
			
			// === ТИПЫ КАМПАНИЙ ===
			'campaign_type': 'campaign_type',
			'campaign_url_path': 'campaign_url_path',
			
			// === ВРЕМЕННЫЕ ИЗМЕРЕНИЯ ===
			'hour_of_day': 'hour_of_day',
			'day_of_week': 'day_of_week',
			'week': 'week',
			'month': 'month',
			'quarter': 'quarter',
			'year': 'year',
			
			// === ВИДЕО СЕГМЕНТАЦИЯ ===
			'video_complete': 'video_complete',
			'video_complete_rate': 'video_complete_rate',
			'video_first_quartile': 'video_first_quartile',
			'video_first_quartile_rate': 'video_first_quartile_rate',
			'video_midpoint': 'video_midpoint',
			'video_midpoint_rate': 'video_midpoint_rate',
			'video_third_quartile': 'video_third_quartile',
			'video_third_quartile_rate': 'video_third_quartile_rate',
			'video_views': 'video_views',
			'video_views_rate': 'video_views_rate'
		};

		// Применяем маппинг полей
		Object.entries(segmentationMapping).forEach(([yandexField, standardField]) => {
			if (transformed[yandexField] !== undefined) {
				transformed[standardField] = transformed[yandexField];
				// Удаляем оригинальное поле если нужно
				if (yandexField !== standardField) {
					delete transformed[yandexField];
				}
			}
		});

		// Совместимость с Facebook (adset = adgroup)
		if (transformed.ad_group_id) {
			transformed.adset_id = transformed.ad_group_id;
		}
		if (transformed.ad_group_name) {
			transformed.adset_name = transformed.ad_group_name;
		}

		// ===== МЕТРИКИ В ЧИСЛА =====
		const numericFields = ['impressions', 'clicks', 'conversions', 'criterion_id'];
		numericFields.forEach(field => {
			if (transformed[field] !== undefined) {
				transformed[field] = DataUtils.safeNumber(transformed[field]);
			}
		});

		// ===== ФИНАНСОВЫЕ ПОЛЯ (микрорубли → рубли) =====
		const MICROROUBLES_TO_ROUBLES = 1_000_000;
		const financialFields = ['cost', 'avg_cpc', 'avg_cpm', 'cost_per_conversion', 'revenue', 'profit'];

		financialFields.forEach(field => {
			if (transformed[field] !== undefined && transformed[field] !== '') {
				transformed[field] = DataUtils.safeNumber(transformed[field]) / MICROROUBLES_TO_ROUBLES;
			}
		});

		// ===== ПРОЦЕНТНЫЕ ПОЛЯ =====
		const percentageFields = ['ctr', 'conversion_rate', 'impression_share'];
		percentageFields.forEach(field => {
			if (transformed[field] !== undefined && transformed[field] !== '') {
				let value = DataUtils.safeNumber(transformed[field]);
				// Если больше 1, считаем что это проценты
				if (value > 1) {
					value = value / 100;
				}
				transformed[field] = value;
			}
		});

		// ===== УСТРОЙСТВО =====
		if (transformed.device) {
			const deviceMap: Record<string, string> = {
				'DESKTOP': 'desktop',
				'MOBILE': 'mobile',
				'TABLET': 'tablet',
				'TV': 'tv'
			};
			const originalDevice = transformed.device;
			transformed.device = deviceMap[originalDevice] || originalDevice.toLowerCase();
		}

		// ===== МЕТАДАННЫЕ =====
		transformed.data_source = 'yandex_direct';
		transformed.currency = 'RUB';

		// ===== ВЫЧИСЛЯЕМЫЕ МЕТРИКИ =====
		if (this.shouldCalculateMetrics) {
			this.calculateDerivedMetrics(transformed);
		}

		return transformed;
	}

	private calculateDerivedMetrics(record: Record<string, any>): void {
		const cost = record.cost || 0;
		const clicks = record.clicks || 0;
		const impressions = record.impressions || 0;
		const conversions = record.conversions || 0;

		if (cost > 0 && clicks > 0) {
			record.avg_cpc = cost / clicks;
		}
		if (cost > 0 && impressions > 0) {
			record.avg_cpm = (cost / impressions) * 1000;
		}
		if (clicks > 0 && impressions > 0) {
			record.ctr = clicks / impressions;
		}
		if (conversions > 0 && clicks > 0) {
			record.conversion_rate = conversions / clicks;
		}
		if (cost > 0 && conversions > 0) {
			record.cost_per_conversion = cost / conversions;
		}

		// ROI и ROAS
		const revenue = record.revenue || 0;
		if (revenue > 0 && cost > 0) {
			record.roas = revenue / cost;
			record.roi = ((revenue - cost) / cost) * 100;
		}
	}
}
