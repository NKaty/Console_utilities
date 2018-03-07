const config = {
  interval: process.env.INT || 5000,
  exitPeriod: process.env.EXT || 33000,
  port: process.env.PORT || 3000
};

module.exports = config;
