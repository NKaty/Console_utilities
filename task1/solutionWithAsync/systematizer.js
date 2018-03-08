const fs = require('fs');
const path = require('path');
const util = require('util');

class Systematizer {
  constructor (originalDir = path.join(__dirname, 'test'), finalDir = path.join(__dirname, 'final'), makeRemovalOriginalDir = false) {
    this.originalDir = originalDir;
    this.finalDir = finalDir;
    this.makeRemovalOriginalDir = !!makeRemovalOriginalDir;
    this.filePromisesArray = [];
  }

  startProcess () {
    try {
      this._verifyPaths();
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
    this._process();
  }

  _verifyPaths () {
    if (!path.isAbsolute(this.originalDir)) this.originalDir = path.join(__dirname, this.originalDir);
    if (!path.isAbsolute(this.finalDir)) this.finalDir = path.join(__dirname, this.finalDir);
    this.originalDir = path.normalize(this.originalDir);
    this.finalDir = path.normalize(this.finalDir);
    const finalDirName = path.dirname(this.finalDir);
    if (!fs.existsSync(finalDirName)) {
      throw new Error('Директории назначения не существует.');
    }
    if (!fs.existsSync(this.originalDir)) {
      throw new Error('Источника не существует.');
    }
    if (!fs.existsSync(this.finalDir)) fs.mkdirSync(this.finalDir);
  }

  async _process () {
    this._addPromiseIntoArray(this.originalDir);
    try {
      await Promise.all(this.filePromisesArray);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
    if (this.makeRemovalOriginalDir) {
      this._removeOriginalDir();
    }
  }

  _addPromiseIntoArray (level) {
    const content = fs.readdirSync(level);
    content.forEach(item => {
      try {
        let itemPath = path.join(level, item);
        let state = fs.statSync(itemPath);
        if (state.isDirectory()) {
          this._addPromiseIntoArray(itemPath);
        } else {
          const dirPath = this._getDirPath(item);
          item = this._checkUniqueName(item, dirPath);
          const newFilePath = path.join(dirPath, item);
          this.filePromisesArray.push(this._fileCopyAndRemovePromise(itemPath, newFilePath));
        }
      } catch (e) {
        console.error(e);
        process.exit(1);
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
    return item;
  }

  _getDirPath (fileName) {
    let dirNameFirstSymbol = fileName.charAt(0).toUpperCase();
    const charCode = dirNameFirstSymbol.charCodeAt(0);
    // Если файл начинается с буквы английского или русского алфавитов или с цифры, создаем папку
    // с названием по первой букве или цифре. Во всех других случаях файл попадает в папку Others
    if (!this._isAllowedSymbol(charCode)) {
      dirNameFirstSymbol = 'Others';
    }
    let newDir = this._makeNewDir(this.finalDir, dirNameFirstSymbol);
    let dirNameExt = path.extname(fileName).slice(1);
    if (!dirNameExt) dirNameExt = 'WithoutExt';
    newDir = this._makeNewDir(newDir, dirNameExt);
    return newDir;
  }

  _isAllowedSymbol (charCode) {
    return (charCode > 47 && charCode < 58) ||
      (charCode > 64 && charCode < 91) ||
      (charCode > 1039 && charCode < 1072) ||
      charCode === 1025;
  }

  _makeNewDir (pathDir, dirName) {
    const newDir = path.join(pathDir, dirName);
    if (!fs.existsSync(newDir)) fs.mkdirSync(newDir);
    return newDir;
  }

  _copyFilePromise (source, target) {
    const rd = fs.createReadStream(source);
    const wr = fs.createWriteStream(target);
    return new Promise(function (resolve, reject) {
      rd.on('error', reject);
      wr.on('error', reject);
      wr.on('finish', resolve);
      rd.pipe(wr);
    }).catch((error) => {
      rd.destroy();
      wr.end();
      throw error;
    });
  }

  _removeFilePromise (source) {
    return util.promisify(fs.unlink)(source);
  }

  async _fileCopyAndRemovePromise (source, target) {
    try {
      await this._copyFilePromise(source, target);
      if (this.makeRemovalOriginalDir) {
        await this._removeFilePromise(source);
      }
    } catch (error) {
      throw error;
    }
  }

  _removeOriginalDir () {
    try {
      while (fs.existsSync(this.originalDir)) {
        this._removeDirs(this.originalDir);
      }
    } catch (e) {
      console.error(e);
    }
  }

  _removeDirs (dir) {
    const dirs = fs.readdirSync(dir);
    if (!dirs.length) return fs.rmdirSync(dir);
    dirs.forEach(item => {
      const dirPath = path.join(dir, item);
      this._removeDirs(dirPath);
    });
  }
}

module.exports = Systematizer;
