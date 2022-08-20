const { lstatSync, readdirSync, ensureDirSync, copyFileSync, writeFileSync, rmSync } = require('fs-extra');
const { resolve } = require('path');
const { dlcName, debug } = require('./config.js');
const { processCarCols, generateCarColsObject } = require('./processing/carcols.js');
const { processCarVariations, generateCarVariationsObject } = require('./processing/carvariations.js');
const { processHandling, generateHandlingObject } = require('./processing/handling.js');
const { processVehicles, generateVehiclesObject } = require('./processing/vehicles.js');
const { generateSetupFile } = require('./generation/setup2.js');
const { generateContentFile } = require('./generation/content.js');
const { logInfo, logDebug, logSuccess, logError, logLogo, logWarning } = require('./helpers.js');
const parser = require('xml2json');
const formatXml = require('xml-formatter');
const { processOxtFile, generateOxtFile } = require('./processing/oxt.js');
const formatOptions = { collapseContent: true, stripComments: true, lineSeparator: '\n' };

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
// This function cleans the output folder, removing old files and folders, and regenerates the structure freshly
function createOutputFolder() {
  logDebug('Cleaning up old output folder');
  rmSync(resolve(__dirname, '../output'), { recursive: true, force: true });

  // Create the folder structure
  logDebug('Creating output folder');
  ensureDirSync(resolve(__dirname, '../output'));
  logDebug('Creating output/x64 folder');
  ensureDirSync(resolve(__dirname, '../output/x64'));
  logDebug('Creating output/x64/audio folder');
  ensureDirSync(resolve(__dirname, '../output/x64/audio'));
  logDebug('Creating output/x64/audio folder');
  ensureDirSync(resolve(__dirname, '../output/x64/audio'));
  logDebug('Creating output/x64/audio/sfx folder');
  ensureDirSync(resolve(__dirname, '../output/x64/audio/sfx'));
  logDebug(`Creating output/x64/audio/sfx/dlc_${dlcName.toLowerCase()} folder`);
  ensureDirSync(resolve(__dirname, `../output/x64/audio/sfx/dlc_${dlcName.toLowerCase()}`));
  logDebug('Creating output/x64/mods.rpf folder');
  ensureDirSync(resolve(__dirname, '../output/x64/mods.rpf'));
  logDebug('Creating output/x64/vehicles.rpf folder');
  ensureDirSync(resolve(__dirname, '../output/x64/vehicles.rpf'));
  logDebug('Creating output/x64/data folder');
  ensureDirSync(resolve(__dirname, '../output/x64/data'));
  logDebug('Creating output/x64/data/lang folder');
  ensureDirSync(resolve(__dirname, '../output/x64/data/lang'));
  logDebug('Creating output/x64/data/lang/americandlc.rpf folder');
  ensureDirSync(resolve(__dirname, '../output/x64/data/lang/americandlc.rpf'));
  logDebug('Creating output/common folder');
  ensureDirSync(resolve(__dirname, '../output/common'));
  logDebug('Creating output/common/ai folder');
  ensureDirSync(resolve(__dirname, '../output/common/ai'));
}
// This function cleans up the output, removing any useless folders like Audio if there is no audio files
function cleanupOutputFolder() {
  // If there are no audio files, remove the audio folder as it is not needed
  const audioConfigDirectory = resolve(__dirname, '../output/x64/audio');
  if (readdirSync(audioConfigDirectory).length === 0) {
    logDebug('Deleting audio config folder, it is empty');
    rmSync(resolve(__dirname, audioConfigDirectory), { recursive: true, force: true });
  }

  // If there are no audio sfx files, remove the audio folder as it is not needed
  const audioSfxDirectory = resolve(__dirname, `../output/x64/audio/sfx/dlc_${dlcName.toLowerCase()}`);
  if (readdirSync(audioSfxDirectory).length === 0) {
    logDebug('Deleting audio sfx folder, it is empty');
    rmSync(resolve(__dirname, '../output/x64/audio/sfx'), { recursive: true, force: true }); // Parent folder
  }

  // If there are no audio files, remove the audio folder as it is not needed
  const audioDirectory = resolve(__dirname, '../output/x64/audio');
  if (readdirSync(audioDirectory).length === 0) {
    logDebug('Deleting audio folder, it is empty');
    rmSync(resolve(__dirname, audioDirectory), { recursive: true, force: true });
  }

  // If there are no mods files, remove the mods folder as it is not needed
  const modsDirectory = resolve(__dirname, '../output/x64/mods.rpf');
  if (readdirSync(modsDirectory).length === 0) {
    logDebug('Deleting mods.rpf folder, it is empty');
    rmSync(modsDirectory, { recursive: true, force: true });
  }

  // If there is no oxt file, remove the x64/data folder as it is not needed
  const oxtDirectory = resolve(__dirname, '../output/x64/data/lang/americandlc.rpf');
  if (readdirSync(oxtDirectory).length === 0) {
    logDebug('Deleting x64/data folder, there are no translations');
    rmSync(resolve(__dirname, '../output/x64/data'), { recursive: true, force: true });
  }

  // If there is no vehiclelayouts files, remove the common/ai folder as it is not needed
  const aiDirectory = resolve(__dirname, '../output/common/ai');
  if (readdirSync(aiDirectory).length === 0) {
    logDebug('Deleting common/ai folder, there are no vehiclelayouts');
    rmSync(aiDirectory, { recursive: true, force: true });
  }
}

(function () {
  logLogo();

  try {

    // Create output
    createOutputFolder();

    // Get all of the input folders to work on
    const mods = getDirectories(resolve(__dirname, '../input'));

    // Helpers
    const audioGameDataNames = []; // String[] of file names
    const audioSoundDataNames = []; // String[] of file names
    const carColEntries = {
      kits: [], // Array of parsed carcol kits
      sirens: [], // Array of parsed carcol sirens
      lights: [] // Array of parsed carcol lights
    };
    const carVarEntries = {
      variationData: [] // Array of parsed carvariations
    };
    const handlingEntries = {
      handling: [] // Array of parsed handling
    };
    const vehicleEntries = {
      initDatas: [], // Array of parsed vehicle initDatas
      txdRelationships: [], // Array of parsed vehicle txdRelationships
    };
    const oxtEntries = []; // Array of strings
    const vehicleLayoutFileNames = []; // Array of strings

    let hasMods = false; // Were any vehicle mods detected
    let hasSfx = false; // Were any sfx audio files detected

    for (const mod of mods) {
      const start = Date.now();
      logInfo(`Processing ${mod}...`);
      const modPath = resolve(__dirname, '../input', mod);

      for (const fileName of readdirSync(modPath)) {
        // Handle vehicles and mods sub folders
        if (lstatSync(resolve(modPath, fileName)).isDirectory()) {
          const subFiles = readdirSync(resolve(modPath, fileName));
          for (const subFile of subFiles) {
            if (fileName.toLowerCase() === 'vehicles') {
              copyFileSync(resolve(modPath, fileName, subFile), resolve(__dirname, '../output/x64/vehicles.rpf', subFile));
              continue;
            }
            if (fileName.toLowerCase() === 'mods') {
              hasMods = true;
              copyFileSync(resolve(modPath, fileName, subFile), resolve(__dirname, '../output/x64/mods.rpf', subFile));
              continue;
            }
            if (fileName.toLowerCase() === 'sfx') {
              hasSfx = true;
              copyFileSync(resolve(modPath, fileName, subFile), resolve(__dirname, `../output/x64/audio/sfx/dlc_${dlcName.toLowerCase()}`, subFile));
            }
          }
          continue;
        }

        if (['carcols.meta', 'carcol.meta'].includes(fileName)) {
          // Car Cols
          processCarCols(modPath, fileName, carColEntries);
          continue;
        }

        if ([
          'carvariations.meta',
          'carvars.meta',
          'carvar.meta'
        ].includes(fileName)) {
          // Car Variations
          processCarVariations(modPath, fileName, carVarEntries);
          continue;
        }

        if (['handling.meta'].includes(fileName)) {
          // Handling
          processHandling(modPath, fileName, handlingEntries);
          continue;
        }

        if (['vehicles.meta', 'vehicle.meta'].includes(fileName)) {
          // Vehicles
          processVehicles(modPath, fileName, vehicleEntries);
          continue;
        }

        if (['vehiclelayouts.meta', 'vehiclelayout.meta'].includes(fileName) || (
          fileName.toLowerCase().endsWith('.meta') && fileName.toLowerCase().startsWith('vehiclelayout')
        )) {
          // Copy file over
          const newFileName = `${mod}_${fileName}`;
          vehicleLayoutFileNames.push(newFileName);
          copyFileSync(resolve(modPath, fileName), resolve(__dirname, '../output/common/ai', newFileName));
          logDebug(`Copied ${fileName} as ${newFileName} to output/common/ai`);
          continue;
        }

        if (fileName.endsWith('.oxt')) {
          processOxtFile(modPath, fileName, oxtEntries);
          continue;
        }

        // Copy audio data files to the audio folder
        if (fileName.endsWith('.rel')) {
          copyFileSync(resolve(modPath, fileName), resolve(__dirname, '../output/x64/audio', fileName));
          if (fileName.endsWith('.dat151.rel') || fileName.endsWith('_game.dat.rel')) {
            // AUDIO_GAMEDATA
            audioGameDataNames.push(fileName.replace('.rel', '').replace('.dat151', '.dat'));
          } else if (fileName.endsWith('.dat54.rel') || fileName.endsWith('_sounds.dat.rel')) {
            // AUDIO_SOUNDDATA
            audioSoundDataNames.push(fileName.replace('.rel', '').replace('.dat54', '.dat'));
          } else {
            logError(`Unknown audio data file ${fileName}`);
          }
          continue;
        }
        // Copy over these additional metadata files
        if (
          fileName.endsWith('.dat151') ||
          fileName.endsWith('.dat54') ||
          fileName.endsWith('.dat151.nametable') ||
          fileName.endsWith('.dat54.nametable')
        ) {
          copyFileSync(resolve(modPath, fileName), resolve(__dirname, '../output/x64/audio', fileName));
          continue;
        }

        if (fileName === 'dlctext.meta') {
          continue; // Ignore this file, it's useless to us for now - used for translations
        }

        if (!fileName.endsWith('.xml') && !fileName.endsWith('.meta')) {
          // Copy over all other random files, like dds
          copyFileSync(resolve(modPath, fileName), resolve(__dirname, '../output/common', fileName));
          logWarning(`Unknown File ${fileName} copied to common folder`);
          continue;
        }

        logError(`Error: Unknown file to process ${fileName}`);
      }

      const end = Date.now();
      const duration = end - start;
      logSuccess(`Processed ${mod} in ${duration}ms!`);
    }

    // Write out the setup2.xml file
    writeFileSync(resolve(__dirname, '../output/setup2.xml'), generateSetupFile(dlcName));
    // Write out the content.xml file
    writeFileSync(resolve(__dirname, '../output/content.xml'), generateContentFile(dlcName, audioGameDataNames, audioSoundDataNames, hasMods, hasSfx, oxtEntries.length !== 0, vehicleLayoutFileNames));

    // Write out the common/dlctext.meta file
    if (oxtEntries.length !== 0) {
      writeFileSync(resolve(__dirname, '../output/common/dlctext.meta'), formatXml(`<?xml version="1.0" encoding="UTF-8"?>
      <CExtraTextMetaFile>
        <hasGlobalTextFile value="true"/>
        <hasAdditionalText value="false"/>
        <isTitleUpdate value="false"/>
      </CExtraTextMetaFile>`, formatOptions));
    }
    // Write out the common/handling.meta file
    const handlingData = generateHandlingObject(handlingEntries);
    if (handlingData !== null) {
      writeFileSync(resolve(__dirname, '../output/common/handling.meta'), formatXml(parser.toXml(handlingData), formatOptions));
    }
    // Write out the common/vehicles.meta file
    const vehicleData = generateVehiclesObject(vehicleEntries);
    if (vehicleData !== null) {
      writeFileSync(resolve(__dirname, '../output/common/vehicles.meta'), formatXml(parser.toXml(vehicleData), formatOptions));
    }
    // Write out the common/carcols.meta file
    const carColData = generateCarColsObject(carColEntries);
    if (carColData !== null) {
      writeFileSync(resolve(__dirname, '../output/common/carcols.meta'), formatXml(parser.toXml(carColData), formatOptions));
    }
    // Write out the common/carvariations.meta file
    const carVarData = generateCarVariationsObject(carVarEntries);
    if (carVarData !== null) {
      writeFileSync(resolve(__dirname, '../output/common/carvariations.meta'), formatXml(parser.toXml(carVarData), formatOptions));
    }
    // Write out the x64/data/lang/americandlc.rpf/global.oxt file
    const oxtData = generateOxtFile(oxtEntries);
    if (oxtData !== null) {
      writeFileSync(resolve(__dirname, '../output/x64/data/lang/americandlc.rpf/global.oxt'), oxtData);
    }

    cleanupOutputFolder();
    logSuccess(`Done! Your output is located at ${resolve(__dirname, '../output')}`);
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
})();
