const { promisify } = require('util');
const fs = require('fs');
const convert = require('heic-convert');
const path = require('path');
const { log } = require('console');

const INPUTDIRECTORY = "./HEIC images/";
const OUTPUTDIRECTORY = "./PNG images/";

let unconvertedFiles = [];
let convertedFiles = [];

fs.readdir(INPUTDIRECTORY, (err, files) => {
  if (err) {
    console.log(err);
  }

  log("Total number of files: " + files.length);

  let completed = 0;

  const loggingInterval = setInterval(() => {
    log(`${completed} out of ${files.length} files have been converted.`);
  }, 1000);

  files.forEach(async file => {
    try{
      const inputBuffer = await promisify(fs.readFile)(`${INPUTDIRECTORY}${file}`);
      const outputBuffer = await convert({
        buffer: inputBuffer, // the HEIC file buffer
        format: 'PNG',      // output format
        quality: 1           // the jpeg compression quality, between 0 and 1
      });
  
      await promisify(fs.writeFile)(`${OUTPUTDIRECTORY}${path.parse(file).name}.png`, outputBuffer).catch(err => {
        log("count not write file: ", file, err);
      });
      completed++;

      convertedFiles.push(file);
    } catch (err) {
      log("could not convert file: ", file, "\n", err);
      unconvertedFiles.push(file);
      completed++;
    }

    if (completed === files.length) {
      clearInterval(loggingInterval);
      log('All files have been processed.');
      if (unconvertedFiles.length > 0) {
        console.log(`The following ${unconvertedFiles.length} files could not be converted:`, unconvertedFiles);
        log(`The following ${convertedFiles.length} files were converted:` , convertedFiles);
      }
    }
  });

});