const { readFileSync } = require('fs-extra');
const parser = require('xml2json');
const { resolve } = require('path');
const { logDebug, logError } = require('../helpers');

const baseHandling = {
  "CVehicleModelInfo__InitDataList": {
    "residentTxd": { "$t": "vehshare" },
    "residentAnims": {},
    "InitDatas": {
      "Item": []
    },
    "txdRelationships": {
      "Item": []
    }
  }
};

module.exports = {
  generateVehiclesObject: function (vehicleEntries) {
    if (vehicleEntries.initDatas.length === 0 && vehicleEntries.txdRelationships.length === 0) {
      // Don't write file
      logDebug(`There is no vehicles data to write, vehicles.meta will not be created`);
      return null;
    }
    const data = {
      ...baseHandling
    };
    data.CVehicleModelInfo__InitDataList.InitDatas.Item = vehicleEntries.initDatas; // Set InitData
    data.CVehicleModelInfo__InitDataList.txdRelationships.Item = vehicleEntries.txdRelationships; // Set txdRelationships
    return data;
  },
  processVehicles: function (modPath, fileName, vehicleEntries) {
    try {
      logDebug(`Reading vehicles data found at ${resolve(modPath, fileName)}`);
      const contents = readFileSync(resolve(modPath, fileName)).toString();
      const fileData = JSON.parse(parser.toJson(contents, { reversible: true }));
      // InitData
      const initData = fileData.CVehicleModelInfo__InitDataList.InitDatas;
      if (initData !== undefined) {
        const initDataItems = Array.isArray(initData.Item) ? initData.Item : [initData.Item];
        vehicleEntries.initDatas.push(...initDataItems);
        logDebug(`Added ${initDataItems.length} Vehicle InitDatas`);
      }
      // txdRelationships
      const txdRelationships = fileData.CVehicleModelInfo__InitDataList.txdRelationships;
      if (txdRelationships !== undefined) {
        const txdRelationshipsItems = Array.isArray(txdRelationships.Item) ? txdRelationships.Item : [txdRelationships.Item];
        vehicleEntries.txdRelationships.push(...txdRelationshipsItems);
        logDebug(`Added ${txdRelationshipsItems.length} Vehicle txdRelationships Items`);
      }
      logDebug(`${fileName} processed`);
    } catch (error) {
      logError(`Error processing ${fileName}: ${error.message}`);
    }
  }
};