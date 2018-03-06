const domain = require('domain').create();

domain.run(function () {
  const http = require('http');
  const TimeGenerator = require('./timeGenerator');
  const config = require('./config');

  const server = http.createServer(function (req, res) {
    if (req.method !== 'GET') return res.end('It is not the correct method.\n');
    const rd = new TimeGenerator(config.interval, config.exitPeriod);
    rd.pipe(process.stdout);
    rd.on('error', (err) => {
      return console.error(err);
    });
    process.stdout.on('error', (err) => {
      return console.error(err);
    });
    rd.on('end', () => {
      res.end('exit');
    });
  });
  server.listen(3000);
});

domain.on('error', (err) => {
  console.error(err.message);
  process.exit(1);
});
