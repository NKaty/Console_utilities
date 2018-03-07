const domain = require('domain').create();

domain.run(function () {
  const http = require('http');
  const TimeGenerator = require('./timeGenerator');
  const config = require('./config');

  const server = http.createServer(function (req, res) {
    if (req.method !== 'GET') return res.end('It is not the correct method.\n');
    const rd = new TimeGenerator(config.interval, config.exitPeriod);
    let answer;

    rd.on('error', (err) => {
      res.end('An error has occurred');
      return console.error(err);
    });

    process.stdout.on('error', (err) => {
      rd.destroy();
      res.end('An error has occurred');
      return console.error(err);
    });

    rd.on('data', (chunk) => {
      answer = chunk.toString();
    });

    rd.on('end', () => {
      res.end(answer);
    });

    rd.pipe(process.stdout);
  });
  server.listen(config.port);
});

domain.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
