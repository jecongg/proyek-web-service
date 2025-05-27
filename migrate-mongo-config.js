require('dotenv').config();

const config = {
  mongodb: {
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/mobile_legend_db",
    databaseName: "mobile_legend_db",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  lockCollectionName: "changelog_lock",
  lockTtl: 0,
  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = config;
