const { readFileSync } = require('fs-extra');
const { resolve } = require('path');
const { logDebug, logError } = require('../helpers');

module.exports = {
  generateOxtFile: function (oxtEntries) {
    if (oxtEntries.length === 0) {
      // Don't write file
      logDebug(`There are no translatable strings to write, global.oxt will not be created`);
      return null;
    }
    // ! This is formatted correctly in the file, but not in the code. Do not change this formatting!
    return `Version 2 30
    {
${oxtEntries.join('\n')}
    }
`;
  },
  processOxtFile: function (modPath, fileName, oxtEntries) {
    try {
      logDebug(`Reading OXT File found at ${resolve(modPath, fileName)}`);
      const contents = readFileSync(resolve(modPath, fileName)).toString();
      const newTranslations = contents.split('\n').filter(e => e.includes(' = '));

      // Ensure no duplicates
      for (const newTranslation of newTranslations) {
        const newAddress = newTranslation.split(' = ')[0];

        let found = false;
        for (const existingEntry of oxtEntries) {
          const existingAddress = existingEntry.split(' = ')[0];
          if (existingAddress === newAddress) {
            found = true;
            break;
          }
        }

        if (found) {
          logDebug(`Skipped ${newTranslation} - Address exists already`);
        } else {
          oxtEntries.push(newTranslation);
          logDebug(`Added ${newTranslation}`);
        }
      }

      logDebug(`${fileName} processed`);
    } catch (error) {
      logError(`Error processing ${fileName}: ${error.message}`);
    }
  }
};