const fs = require('fs');
const path = require('path');

class Seed {
  constructor (levels = 4, dirName = path.join(__dirname, 'test'), sourceFile = path.join(__dirname, 'seed.jpg')) {
    this.levels = levels;
    this.dirName = dirName;
    this.sourceFile = sourceFile;
    this.extnames = ['.png', '.jpg'];
  }

  _getRandomName (n) {
    let string = '';
    while (string.length < n) {
      string += String.fromCharCode(Math.random() * 1106).replace(/[^0-9a-zA-Zа-яА-ЯёЁ]|_/g, '');
    }
    return string;
  }

  _getRandomFileName () {
    const name = this._getRandomName(1).repeat(3);
    const ext = Math.random() > 0.5 ? this.extnames[0] : this.extnames[1];
    return `${name}${ext}`;
  }

  createTree () {
    try {
      this._verifyPaths();
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
    this._creatingProcess(this.dirName, this.levels);
  }

  _creatingProcess (dir, counter) {
    let count = counter;
    if (!count) return;
    while (true) {
      if (!count) return;
      const bool = (count === 1);
      const newDir = path.join(dir, this._getRandomName(8));
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
      throw Error('Директории назначения не существует.');
    }
    if (!fs.existsSync(this.sourceFile)) {
      throw Error('Файл для копирования не существует.');
    }
    if (!fs.existsSync(this.dirName)) {
      fs.mkdirSync(this.dirName);
    } else {
      // Чтобы случайно не испортить нужную папку
      const content = fs.readdirSync(this.dirName);
      if (content.length) throw Error('Директория для теста должна быть пустой.');
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
      rd.destroy();
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
}

const seed = new Seed();
seed.createTree();
