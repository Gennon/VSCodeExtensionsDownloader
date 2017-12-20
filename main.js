const download = require("./lib/downloader").download;
const program = require("commander");
const pkg = require("./package.json");

program
  .version(pkg.version)
  .option(
    "-f, --flat",
    "Save the VSIX in a flat structure, othwerwise makes use of Publisher/Extension/Version structure. [false]"
  )
  .option("-a, --archive", "Archive the final folder as a tar ball. [false]")
  .option("-v, --verbose", "Prints detailed progress. [false]")
  .parse(process.argv);

if (program.flat === undefined) {
  program.flat = false;
}

if (program.archive === undefined) {
  program.archive = false;
}

if (program.verbose === undefined) {
  program.verbose = false;
}

const { archive, flat, verbose } = program;

download({ archive, flat, verbose });
