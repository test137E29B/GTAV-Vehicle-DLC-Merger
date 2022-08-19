const { readFileSync } = require('fs-extra');
const parser = require('xml2json');
const { resolve } = require('path');
const { logDebug, logError } = require('../helpers');

const baseCarVariations = {
  "CVehicleModelInfoVariation": {
    "variationData": {
      "Item": []
    }
  }
};

module.exports = {
  generateCarVariationsObject: function (carVariationsEntries) {
    if (carVariationsEntries.variationData.length === 0) {
      // Don't write file
      logDebug(`There are no car variations to write, carvariations.meta will not be created`);
      return null;
    }
    const data = {
      ...baseCarVariations
    };
    data.CVehicleModelInfoVariation.variationData.Item = carVariationsEntries.variationData; // Set kits
    return data;
  },
  processCarVariations: function (modPath, fileName, carVariationsEntries) {
    try {
      logDebug(`Reading carvariations found at ${resolve(modPath, fileName)}`);
      const contents = readFileSync(resolve(modPath, fileName)).toString();
      const fileData = JSON.parse(parser.toJson(contents, { reversible: true }));
      const variationData = fileData.CVehicleModelInfoVariation.variationData;
      if (variationData !== undefined) {
        const variationDataItems = Array.isArray(variationData.Item) ? variationData.Item : [variationData.Item];
        carVariationsEntries.variationData.push(...variationDataItems);
        logDebug(`Added ${variationDataItems.length} CarVariation Variations`);
      }
      logDebug(`${fileName} processed`);
    } catch (error) {
      logError(`Error processing ${fileName}: ${error.message}`);
    }
  }
};