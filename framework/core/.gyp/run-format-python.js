const path = require('path');
const { shell } = require('../lib');

function main(argv) {
  const cwd = process.cwd();
  const coreDir = path.dirname(__dirname);

  shell.run('black', ['--version'], false);
  shell.runAndExit('black', argv);

  process.chdir(coreDir);
  const pipenvPath = path.resolve(shell.runAndCollect('pipenv', ['--py']).out);
  const blackBin = process.platform === 'win32' ? 'black.exe' : 'black';
  const blackPath = path.resolve(path.dirname(pipenvPath), blackBin);
  process.chdir(cwd);
  shell.runAndExit(blackPath, argv);

  process.chdir(coreDir);
  shell.run('pipenv', ['run', 'black', '--version'], true, { tolerant: true });
  shell.run('pipenv', ['run', 'black'].concat(argv));
}

module.exports.main = main;

if (require.main === module) {
  main(process.argv.slice(2));
}
