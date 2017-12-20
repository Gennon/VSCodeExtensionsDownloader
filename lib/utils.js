const fs = require("fs");
const path = require("path");

const createFolderIfNotExist = folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
};

const writeResponseToFile = (fileName, response) => {
  const file = fs.createWriteStream(fileName);
  response.pipe(file);
  file.on("close", () => {
    console.log(`${fileName} has been downloaded`);
  });
};

const isDirectory = source => fs.lstatSync(source).isDirectory();

const getDirectories = source =>
  fs
    .readdirSync(source)
    .map(name => path.join(source, name))
    .filter(isDirectory)
    .map(name => path.basename(name));

module.exports = {
  createFolderIfNotExist,
  getDirectories,
  writeResponseToFile
};
