const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

module.exports = class DatabaseManager {
    static db = null;
    static dbFilePath = './database/database.db';

    static async openConnection(dbFilePath) {
        return new Promise((resolve, reject) => {
            if (DatabaseManager.db) {
                console.log("Database connection already open.");
                resolve();
            } else {
                DatabaseManager.db = new sqlite3.Database(DatabaseManager.dbFilePath, (err) => {
                    if (err) {
                        console.error("Error opening database:", err.message);
                        reject(err);
                    } else {
                        console.log("Connected to the database");
                        resolve();
                    }
                });
            }
        });
    }

    static async closeConnection() {
        return new Promise((resolve, reject) => {
            if (DatabaseManager.db) {
                const db = DatabaseManager.db;
                DatabaseManager.db = null;
                db.close((err) => {
                    if (err) {
                        console.error("Error closing database:", err.message);
                        reject(err);
                    } else {
                        console.log("Database connection closed");
                        resolve();
                    }
                });
            } else {
                console.log("No active database connection to close.");
                resolve();
            }
        });
    }

    static async getConnection() {
        // Check if the connection is open or if it's time to close it
        if (!DatabaseManager.db || Date.now() - DatabaseManager.lastActivityTime > DatabaseManager.connectionTimeout) {
            await DatabaseManager.openConnection();
            DatabaseManager.lastActivityTime = Date.now();
        } else {
            console.log("Reusing existing database connection.");
        }

        return DatabaseManager.db;
    }


    static async runQuery(query, params = []) {
        return new Promise((resolve, reject) => {
            DatabaseManager.db.serialize(() => {
                const stmt = DatabaseManager.db.prepare(query);
                stmt.all(...params, (err, rows) => {
                    stmt.finalize();

                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        });
    }

    static async runUpdate(query, params = []) {
        return new Promise((resolve, reject) => {
            DatabaseManager.db.serialize(() => {
                const stmt = DatabaseManager.db.prepare(query);
                stmt.run(...params, function (err) {
                    stmt.finalize();

                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                });
            });
        });
    }


    static runScript(filePath) {
        this.getConnection();

        const databaseExists = fs.existsSync(this.dbFilePath);
        if (databaseExists) {
            console.log('Database already exists')
            return;
        }

        return new Promise((resolve, reject) => {
            // Read the script from the file
            fs.readFile(filePath, 'utf8', (readErr, script) => {
                if (readErr) {
                    reject(readErr);
                    return;
                }

                // Execute the script
                this.db.exec(script, (scriptErr) => {
                    if (scriptErr) {
                        reject(scriptErr);
                    } else {
                        console.log('Initialised database')
                        resolve();
                    }
                });
            });
        });
    }


    static async beginTransaction() {
        return new Promise((resolve, reject) => {
            if (!DatabaseManager.db) {
                reject(new Error("No active database connection."));
            }

            DatabaseManager.db.run('BEGIN TRANSACTION', (err) => {
                if (err) {
                    console.error("Error starting transaction:", err.message);
                    reject(err);
                } else {
                    console.log("Transaction started");
                    resolve();
                }
            });
        });
    }

    static async rollbackTransaction() {
        return new Promise((resolve, reject) => {
            if (!DatabaseManager.db) {
                console.log("No active database connection.");
                resolve();
            } else {
                DatabaseManager.db.run('ROLLBACK', (err) => {
                    if (err) {
                        console.error("Error rolling back transaction:", err.message);
                        reject(err);
                    } else {
                        console.log("Transaction rolled back");
                        resolve();
                    }
                });
            }
        });
    }

    static async commitTransaction() {
        return new Promise((resolve, reject) => {
            if (!DatabaseManager.db) {
                console.log("No active database connection.");
                resolve();
            } else {
                DatabaseManager.db.run('COMMIT', (err) => {
                    if (err) {
                        console.error("Error committing transaction:", err.message);
                        reject(err);
                    } else {
                        console.log("Transaction committed");
                        resolve();
                    }
                });
            }
        });
    }
}