const Systematizer = require('./systematizer');
const source = process.argv[2];
const target = process.argv[3];
const mustBeRemoved = getBoolean(process.argv[4]);

function getBoolean (string) {
  let bool;
  switch (string) {
    case 'true':
    case '1':
    case 'yes':
    case 'да':
      bool = true;
      break;
    case 'false':
    case '0':
    case 'no':
    case 'нет':
    case 'undefined':
    case 'null':
      bool = false;
      break;
    default:
      bool = !!string;
  }
  return bool;
}

const syst = new Systematizer(source, target, mustBeRemoved);
syst.startProcess();
