const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const createArchiver = (fileName, type = "tar") => {
  const output = fs.createWriteStream(
    path.join(__dirname, "../", `${fileName}.${type}`)
  );
  output.on("close", () => {
    console.log(`${fileName}.${type} has been created successfully`);
  });

  const archive = archiver(type);
  archive.pipe(output);
  return archive;
};

module.exports = {
  createArchiver
};
