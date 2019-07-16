// In this file you can configure migrate-mongo
const config = {
  mongodb: {
    url: process.env.MONGODB_URI,

    databaseName: 'stashaway',

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
    },
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'migrations',

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: 'changelog',
};

//Return the config as a promise
module.exports = config;
