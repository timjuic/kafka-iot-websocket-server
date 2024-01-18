class FilterSettingDAO {
    constructor(dbManager) {
        this.dbManager = dbManager;
    }

    async getFilterSettings() {
        const query = 'SELECT * FROM filter_settings';
        try {
            const rows = await this.dbManager.runQuery(query);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async updateFilterSetting(event, enabled) {
        const query = 'INSERT OR REPLACE INTO filter_settings (event, enabled) VALUES (?, ?)';
        const params = [event, enabled];

        try {
            await this.dbManager.runUpdate(query, params);
            console.log(`Updated filter setting for event: ${event}`);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = FilterSettingDAO;