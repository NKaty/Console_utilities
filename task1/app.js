const Systematizer = require('./systematizer');
const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .example('$0 -s source -t target -r', 'Copy and organize files from source to target and remove source.')
  .alias('s', 'source')
  .alias('t', 'target')
  .boolean('r')
  .alias('r', 'remove')
  .nargs('s', 0)
  .nargs('t', 0)
  .describe('s', 'Source for copying')
  .describe('t', 'Target for copying')
  .describe('r', 'Boolean. If true, remove source. If false, do not remove source. ')
  .default('s', 'test')
  .default('t', 'final')
  .default('r', 'false')
  .help('h')
  .alias('h', 'help')
  .argv;

const source = argv.source;
const target = argv.target;
const mustBeRemoved = argv.remove;

const systematizer = new Systematizer(source, target, mustBeRemoved);
systematizer.startProcess();

// Вариант без yargs
// const source = process.argv[2];
// const target = process.argv[3];
// const mustBeRemoved = getBoolean(process.argv[4]);
//
// function getBoolean (string) {
//   let bool;
//   switch (string) {
//     case 'true':
//     case '1':
//     case 'yes':
//     case 'да':
//       bool = true;
//       break;
//     case 'false':
//     case '0':
//     case 'no':
//     case 'нет':
//     case 'undefined':
//     case 'null':
//       bool = false;
//       break;
//     default:
//       bool = !!string;
//   }
//   return bool;
// }
