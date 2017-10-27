import fs from "fs";
import path from "path";
import https from 'https';

const download = () => {
  console.log("Downloading...")
  const extensionsDirectory = path.join(process.env.HOMEPATH, "/.vscode/extensions");
  const folder = path.join(process.cwd(), 'extensions')
  if (!fs.existsSync(folder)){
    fs.mkdirSync(folder);
  }
  
  const installedExtensions = getInstalledExtensions(extensionsDirectory);
  installedExtensions.forEach(({publisher, extension, version}) => {
    const fileName =  `${publisher}.${extension}-${version}.vsix`;
    const downloadUrl = `https://${publisher}.gallery.vsassets.io/_apis/public/gallery/publisher/${publisher}/extension/${extension}/${version}/assetbyname/Microsoft.VisualStudio.Services.VSIXPackage`;
    downloadFile(downloadUrl, path.join(folder, fileName));
  });
}

const getInstalledExtensions = directory => {
  return getDirectories(directory)
    .map(folder => {
      const publisherSeparator = folder.indexOf(".", 0);
      const extensionSeparator = folder.lastIndexOf("-");
      const publisher = folder.slice(0, publisherSeparator);
      const extension = folder.slice(publisherSeparator+1, extensionSeparator);
      const version = folder.slice(extensionSeparator+1, folder.length);
      return {publisher, extension, version}
    });
}

const isDirectory = source => fs.lstatSync(source).isDirectory()

const getDirectories = source =>
  fs.readdirSync(source)
    .map(name => path.join(source, name))
    .filter(isDirectory)
    .map(name => path.basename(name))


const downloadFile = (url, fileName) => {
  const request = https.get(url, response => {
    if(response.statusCode >= 200 && response.statusCode < 300){
      const file = fs.createWriteStream(fileName);
      response.pipe(file);
      file.on('finish', () => {
        file.close();  // close() is async, call cb after close completes.
      });
    }
    else if(response.headers.location){
      return downloadFile(response.headers.location, fileName);
    }
  })
};


download();