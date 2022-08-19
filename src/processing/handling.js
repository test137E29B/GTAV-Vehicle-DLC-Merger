const { readFileSync } = require('fs-extra');
const parser = require('xml2json');
const { resolve } = require('path');
const { logDebug, logError } = require('../helpers');

const baseHandling = {
  "CHandlingDataMgr": {
    "HandlingData": {
      "Item": []
    }
  }
};

module.exports = {
  generateHandlingObject: function (handlingEntries) {
    if (handlingEntries.handling.length === 0) {
      // Don't write file
      logDebug(`There is no vehicle handling data to write, handling.meta will not be created`);
      return null;
    }
    const data = {
      ...baseHandling
    };
    data.CHandlingDataMgr.HandlingData.Item = handlingEntries.handling; // Set kits
    return data;
  },
  processHandling: function (modPath, fileName, handlingEntries) {
    try {
      logDebug(`Reading handling found at ${resolve(modPath, fileName)}`);
      const contents = readFileSync(resolve(modPath, fileName)).toString();
      const fileData = JSON.parse(parser.toJson(contents, { reversible: true }));
      const handlingData = fileData.CHandlingDataMgr.HandlingData;
      if (handlingData !== undefined) {
        const handlingDataItems = Array.isArray(handlingData.Item) ? handlingData.Item : [handlingData.Item];
        handlingEntries.handling.push(...handlingDataItems);
        logDebug(`Added ${handlingDataItems.length} Handling Items`);
      }
      logDebug(`${fileName} processed`);
    } catch (error) {
      logError(`Error processing ${fileName}: ${error.message}`);
    }
  }
};