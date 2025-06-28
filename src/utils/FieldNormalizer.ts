/**
 * Утилита для нормализации имен полей из CamelCase в snake_case
 */
export class FieldNormalizer {
    /**
     * Преобразует все ключи объекта из CamelCase в snake_case
     * Примеры:
     * - CampaignId → campaign_id
     * - AdGroupName → ad_group_name
     * - Cost → cost
     * - AvgCpm → avg_cpm
     */
    static normalize(record: Record<string, any>): Record<string, any> {
        const normalized: Record<string, any> = {};
        
        for (const [key, value] of Object.entries(record)) {
            const normalizedKey = this.camelToSnake(key);
            normalized[normalizedKey] = value;
        }
        
        return normalized;
    }
    
    /**
     * Преобразует строку из CamelCase в snake_case
     * Правильно обрабатывает аббревиатуры: HTMLVideoAds → html_video_ads, CPMOptimized → cpm_optimized
     */
    private static camelToSnake(str: string): string {
        // Шаг 1: Разделяем последовательности заглавных букв перед строчными
        // HTMLVideo → HTML_Video, XMLParser → XML_Parser
        let result = str.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2');
        
        // Шаг 2: Добавляем подчеркивания перед заглавными буквами после строчных или цифр
        // campaignId → campaign_Id, cost2CPM → cost2_CPM
        result = result.replace(/([a-z\d])([A-Z])/g, '$1_$2');
        
        // Шаг 3: Преобразуем в нижний регистр
        return result.toLowerCase();
    }
}