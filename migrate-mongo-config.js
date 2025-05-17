module.exports = {
  mongodb: {
    url: "mongodb://127.0.0.1:27017",
    databaseName: "mobile_legend_db",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  migrationsDir: "migrations",                      // ✅ ini wajib benar
  changelogCollectionName: "migrations",            // ✅ tidak boleh null
  migrationFileExtension: ".js",                    // ✅ jangan kosong
  useFileHash: false
};
