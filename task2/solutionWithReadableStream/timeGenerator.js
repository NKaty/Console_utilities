const {Readable} = require('stream');

class TimeGenerator extends Readable {
  constructor (interval = 5000, exitPeriod = 33000, options) {
    super(options);
    this._interval = interval;
    this._exitPeriod = exitPeriod;
    this._exitTime = 0;
    this._firstTime = true;
    this._lastTime = false;
    // Чтобы легче было проверять работу нескольких одновременных запросов
    this._counter = 0;
    this._init();
  }

  _init () {
    try {
      this._verifyParam();
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
    // Событие срабатывает слишком поздно
    // this.once('readable', this._getExitTime);
    this._getExitTime();
  }

  _verifyParam () {
    this._interval = parseInt(this._interval);
    if (isNaN(this._interval)) throw Error('Интервал вывода даты и времени должен быть числом.');
    this._exitPeriod = parseInt(this._exitPeriod);
    if (isNaN(this._exitPeriod)) throw Error('Время завершения работы сервера должено быть числом.');
  }

  _getExitTime () {
    this._exitTime = Date.now() + this._exitPeriod;
  }

  // Вынесено в отдельный метод, так как может поменяться желаемое представление даты (например, выводить только время)
  _getBufferWithTimestamp () {
    this._counter++;
    const date = `${this._counter}: ${new Date().toUTCString()}\n`;
    return Buffer.from(date);
  }

  _checkTimeExit () {
    const nowDate = Date.now();
    const nextPrintTime = nowDate + this._interval;
    if (nextPrintTime > this._exitTime) {
      const leftTime = this._exitTime - nowDate;
      setTimeout(() => {
        if (!this._lastTime) {
          this._lastTime = true;
          this.push(this._getBufferWithTimestamp());
          return;
        }
        this.push(null);
      }, leftTime);
      return true;
    }
  }

  _read (size) {
    if (this._firstTime) {
      this._firstTime = false;
      this.push(this._getBufferWithTimestamp());
      return;
    }
    if (this._checkTimeExit()) {
      return;
    }
    setTimeout(() => {
      this.push(this._getBufferWithTimestamp());
    }, this._interval);
  }
}

module.exports = TimeGenerator;
