const fs = require('fs');
const path = require('path');

class Seed {
  constructor (levels, dirName, sourceFile) {
    this.levels = levels || 4;
    this.dirName = dirName || path.join(__dirname, 'test1');
    this.possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789';
    this.extnames = ['.png', '.jpg'];
    this.sourceFile = sourceFile || path.join(__dirname, 'seed.jpg');
  }

  _getRandomSymbol () {
    return this.possible.split(',').map(
      () => this.possible.charAt(Math.floor(Math.random() * this.possible.length))).join('');
  }

  _getRandomFileName () {
    const name = this._getRandomSymbol().repeat(3);
    const ext = Math.random() > 0.5 ? this.extnames[0] : this.extnames[1];
    return `${name}${ext}`;
  }

  _getRandomDirName () {
    let dirName = '';
    for (let i = 0; i < 8; i++) {
      dirName += this._getRandomSymbol();
    }
    return dirName;
  }

  createTree () {
    this._verifyPaths();
    this._creatingProcess(this.dirName, this.levels);
  }

  _creatingProcess (dir, counter) {
    let count = counter;
    if (!count) return;
    while (true) {
      if (!count) return;
      const bool = (count === 1);
      const newDir = path.join(dir, this._getRandomDirName());
      fs.mkdirSync(newDir);
      if (!bool) {
        this._createFiles(dir, bool);
      } else {
        this._createFiles(newDir, bool);
      }
      count--;
      this._creatingProcess(newDir, count);
    }
  }

  _createFiles (dir, bool) {
    const newFile = path.join(dir, this._getRandomFileName());
    this._copyFile(this.sourceFile, newFile, onError);
    if (bool) {
      const newFileWithDot = path.join(dir, '.eslintrc');
      fs.writeFile(newFileWithDot, '{}', onError);
    }

    function onError (err) {
      if (err) console.error(err);
    }
  }

  _verifyPaths () {
    if (!path.isAbsolute(this.dirName)) this.dirName = path.join(__dirname, this.dirName);
    if (!path.isAbsolute(this.sourceFile)) this.sourceFile = path.join(__dirname, this.sourceFile);
    this.dirName = path.normalize(this.dirName);
    this.sourceFile = path.normalize(this.sourceFile);
    const dirPath = path.dirname(this.dirName);
    if (!fs.existsSync(dirPath)) {
      this._exitOnError('ERROR. Директории назначения не существует.');
    }
    if (!fs.existsSync(this.sourceFile)) {
      this._exitOnError('ERROR. Файл для копирования не существует.');
    }
    if (!fs.existsSync(this.dirName)) {
      fs.mkdirSync(this.dirName);
    } else {
      const content = fs.readdirSync(this.dirName);
      if (content.length) this._exitOnError('ERROR. Директория для теста должна быть пустой.');
    }
  }

  _copyFile (source, target, cb) {
    let cbCalled = false;
    const rd = fs.createReadStream(source);
    rd.on('error', function (err) {
      done(err);
    });
    const wr = fs.createWriteStream(target);
    wr.on('error', function (err) {
      done(err);
    });
    wr.on('finish', function () {
      done();
    });
    rd.pipe(wr);

    function done (err) {
      if (!cbCalled) {
        cb(err);
        cbCalled = true;
      }
    }
  }

  _exitOnError (message) {
    console.log(message);
    process.exit(1);
  }
}

const seed = new Seed();
seed.createTree();
