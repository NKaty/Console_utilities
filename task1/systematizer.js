const fs = require('fs');
const path = require('path');

class Systematizer {
  constructor (originalDir, finalDir, makeRemovalOriginalDir) {
    this.originalDir = originalDir || path.join(__dirname, 'test');
    this.finalDir = finalDir || path.join(__dirname, 'final');
    this.makeRemovalOriginalDir = !!makeRemovalOriginalDir || false;
    this.numberOfFiles = 0;
    this.numberOfFinishedFiles = 0;
    this.numberOfRemovedFiles = 0;
  }

  startProcess () {
    this._verifyPaths();
    this._process(this.originalDir);
  }

  _verifyPaths () {
    if (!path.isAbsolute(this.originalDir)) this.originalDir = path.join(__dirname, this.originalDir);
    if (!path.isAbsolute(this.finalDir)) this.finalDir = path.join(__dirname, this.finalDir);
    this.originalDir = path.normalize(this.originalDir);
    this.finalDir = path.normalize(this.finalDir);
    const finalDirName = path.dirname(this.finalDir);
    if (!fs.existsSync(finalDirName)) {
      this._exitOnError('Директории назначения не существует.');
    }
    if (!fs.existsSync(this.originalDir)) {
      this._exitOnError('Источника не существует.');
    }
    if (!fs.existsSync(this.finalDir)) fs.mkdirSync(this.finalDir);
  }

  _process (level) {
    const content = fs.readdirSync(level);
    content.forEach(item => {
      let itemPath = path.join(level, item);
      let state = fs.statSync(itemPath);
      if (state.isDirectory()) {
        this._process(itemPath);
      } else {
        const dirPath = this._getDirPath(item);
        item = this._checkUniqueName(item, dirPath);
        this.numberOfFiles++;
        const newFilePath = path.join(dirPath, item);
        this._copyFile(itemPath, newFilePath, this._doAfterFilesCopied);
      }
    });
  }

  _checkUniqueName (item, dirPath) {
    // Если есть несколько файлов с одинаковыми именами прибавляем к имени 1.
    // Например, cat - cat1 - cat11 и т.д.
    const list = fs.readdirSync(dirPath);
    while (~list.indexOf(item)) {
      const parseItem = path.parse(item);
      item = `${parseItem.name}1${parseItem.ext}`;
    }
    list.push(item);
    return item;
  }

  _getDirPath (fileName) {
    let dirNameFirstSymbol = fileName.charAt(0).toUpperCase();
    const charCode = dirNameFirstSymbol.charCodeAt(0);
    // Если файл начинается с буквы английского или русского алфавитов или с цифры, создаем папку
    // с названием по первой букве или цифре. Во всех других случаях файл попадает в папку Others
    if (!((charCode > 47 && charCode < 58) ||
      (charCode > 64 && charCode < 91) ||
      (charCode > 1039 && charCode < 1072) ||
      charCode === 1025)) {
      dirNameFirstSymbol = 'Others';
    }
    let newDir = this._makeNewDir(this.finalDir, dirNameFirstSymbol);
    let dirNameExt = path.extname(fileName).slice(1);
    if (!dirNameExt) dirNameExt = 'WithoutExt';
    newDir = this._makeNewDir(newDir, dirNameExt);
    return newDir;
  }

  _makeNewDir (pathDir, dirName) {
    const newDir = path.join(pathDir, dirName);
    if (!fs.existsSync(newDir)) fs.mkdirSync(newDir);
    return newDir;
  }

  _copyFile (source, target, cb) {
    const me = this;
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
      me.numberOfFinishedFiles++;
      done();
    });
    rd.pipe(wr);

    function done (err) {
      if (!cbCalled) {
        cb(err, me, source);
        cbCalled = true;
      }
    }
  }

  _doAfterFilesCopied (err, me, source) {
    if (err) return console.error(err);
    if (me.makeRemovalOriginalDir) {
      me._removeOriginalDir(me, source);
    }
  }

  _removeOriginalDir (me, source) {
    fs.unlink(source, (err) => {
      if (err) return console.error(err);
      me.numberOfRemovedFiles++;
      if (me.numberOfFiles === me.numberOfFinishedFiles && me.numberOfFinishedFiles === me.numberOfRemovedFiles) {
        while (fs.existsSync(me.originalDir)) {
          me._removeDirs(me.originalDir);
        }
      }
    });
  }

  _removeDirs (dir) {
    const dirs = fs.readdirSync(dir);
    if (!dirs.length) return fs.rmdirSync(dir);
    dirs.forEach(item => {
      const dirPath = path.join(dir, item);
      this._removeDirs(dirPath);
    });
  }

  _exitOnError (message) {
    console.log(message);
    process.exit(1);
  }
}

module.exports = Systematizer;
