const http = require('http');

const server = http.createServer(function (req, res) {
  if (req.method !== 'GET') return res.end('It is not the correct method.\n');
  const interval = +process.env.INT || 30000;
  const exitPeriod = +process.env.EXT || 95000;
  const exitTime = Date.now() + exitPeriod;
  const printDate = () => {
    const date = new Date();
    console.log(date);
  };
  const checkTimeExit = () => {
    const nowDate = Date.now();
    const nextPrintTime = nowDate + interval;
    if (nextPrintTime > exitTime) {
      const leftTime = exitTime - nowDate;
      clearInterval(timer);
      setTimeout(() => {
        printDate();
        res.end('exit');
      }, leftTime);
    }
  };
  printDate();
  const timer = setInterval(() => {
    printDate();
    checkTimeExit();
  }, interval);
});
server.listen(3000);
