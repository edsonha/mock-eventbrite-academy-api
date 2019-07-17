module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: "stashaway"
    },
    binary: {
      version: "4.0.3",
      skipMD5: true
    },
    autoStart: false
  }
};
