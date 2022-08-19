const { readFileSync } = require('fs-extra');
const parser = require('xml2json');
const { resolve } = require('path');
const { logDebug, logError } = require('../helpers');

const baseCarCols = {
  "CVehicleModelInfoVarGlobal": {
    "Kits": {
      "Item": []
    },
    "Sirens": {
      "Item": []
    },
    "Lights": {
      "Item": []
    }
  }
};

module.exports = {
  generateCarColsObject: function (carColEntries) {
    if (
      carColEntries.kits.length === 0 &&
      carColEntries.sirens.length === 0 &&
      carColEntries.lights.length === 0
    ) {
      // Don't write file
      logDebug(`There are no car cols to write, carcols.meta will not be created`);
      return null;
    }
    const data = {
      ...baseCarCols
    };
    data.CVehicleModelInfoVarGlobal.Kits.Item = carColEntries.kits; // Set kits
    data.CVehicleModelInfoVarGlobal.Sirens.Item = carColEntries.sirens; // Set sirens
    data.CVehicleModelInfoVarGlobal.Lights.Item = carColEntries.lights; // Set lights
    return data;
  },
  processCarCols: function (modPath, fileName, carColEntries) {
    try {
      logDebug(`Reading carcols found at ${resolve(modPath, fileName)}`);
      const contents = readFileSync(resolve(modPath, fileName)).toString();
      const fileData = JSON.parse(parser.toJson(contents, { reversible: true }));
      // Kits
      const kits = fileData.CVehicleModelInfoVarGlobal.Kits;
      if (kits !== undefined) {
        const kitItems = Array.isArray(kits.Item) ? kits.Item : [kits.Item];
        carColEntries.kits.push(...kitItems);
        logDebug(`Added ${kitItems.length} CarCol Kits`);
      }
      // Sirens
      const sirens = fileData.CVehicleModelInfoVarGlobal.Sirens;
      if (sirens !== undefined) {
        const sirenItems = Array.isArray(sirens.Item) ? sirens.Item : [sirens.Item];
        carColEntries.sirens.push(...sirenItems);
        logDebug(`Added ${sirenItems.length} CarCol Sirens`);
      }
      // Lights
      const lights = fileData.CVehicleModelInfoVarGlobal.Lights;
      if (lights !== undefined) {
        const lightItems = Array.isArray(lights.Item) ? lights.Item : [lights.Item];
        carColEntries.lights.push(...lightItems);
        logDebug(`Added ${lightItems.length} CarCol Lights`);
      }
      logDebug(`${fileName} processed`);
    } catch (error) {
      logError(`Error processing ${fileName}: ${error.message}`);
    }
  }
};