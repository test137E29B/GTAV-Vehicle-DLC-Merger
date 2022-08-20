const formatXml = require('xml-formatter');

module.exports = {
  generateContentFile: function (dlcName, audioGameDataNames, audioSoundDataNames, hasMods, hasSfx, hasTranslations, vehicleLayoutFileNames) {
    return formatXml(`<?xml version="1.0" encoding="UTF-8"?>
    <CDataFileMgr__ContentsOfDataFileXml>
      <disabledFiles />
      <includedXmlFiles />
      <includedDataFiles />
      <dataFiles>
        <!-- Audio Files -->
        ${audioGameDataNames.map(audioFileName => `<Item>
          <filename>dlc_${dlcName.toLowerCase()}:/%PLATFORM%/audio/${audioFileName}</filename>
          <fileType>AUDIO_GAMEDATA</fileType>
          <overlay value="false"/>
          <disabled value="true"/>
          <persistent value="false"/>
        </Item>`).join('\n        ')}
        ${audioSoundDataNames.map(audioFileName => `<Item>
          <filename>dlc_${dlcName.toLowerCase()}:/%PLATFORM%/audio/${audioFileName}</filename>
          <fileType>AUDIO_SOUNDDATA</fileType>
          <overlay value="false"/>
          <disabled value="true"/>
          <persistent value="false"/>
        </Item>`).join('\n        ')}
        ${hasSfx ? `<Item>
          <filename>dlc_${dlcName.toLowerCase()}:/%PLATFORM%/audio/sfx/dlc_${dlcName.toLowerCase()}</filename>
          <fileType>AUDIO_WAVEPACK</fileType>
          <overlay value="false" />
          <disabled value="true" />
          <persistent value="false" />
        </Item>` : ''}

        <!-- Generic Files -->
        <Item>
          <filename>dlc_${dlcName.toLowerCase()}:/common/vehicles.meta</filename>
          <fileType>VEHICLE_METADATA_FILE</fileType>
          <overlay value="false" />
          <disabled value="true" />
          <persistent value="false" />
        </Item>
        <Item>
          <filename>dlc_${dlcName.toLowerCase()}:/common/carcols.meta</filename>
          <fileType>CARCOLS_FILE</fileType>
          <overlay value="false" />
          <disabled value="true" />
          <persistent value="false" />
        </Item>
        <Item>
          <filename>dlc_${dlcName.toLowerCase()}:/common/carvariations.meta</filename>
          <fileType>VEHICLE_VARIATION_FILE</fileType>
          <overlay value="false" />
          <disabled value="true" />
          <persistent value="false" />
        </Item>
        <Item>
          <filename>dlc_${dlcName.toLowerCase()}:/common/handling.meta</filename>
          <fileType>HANDLING_FILE</fileType>
          <overlay value="false" />
          <disabled value="true" />
          <persistent value="false" />
        </Item>
        <Item>
          <filename>dlc_${dlcName.toLowerCase()}:/%PLATFORM%/vehicles.rpf</filename>
          <fileType>RPF_FILE</fileType>
          <locked value="true"/>
          <overlay value="true" />
          <disabled value="true" />
          <persistent value="true" />
        </Item>

        <!-- Vehicle Mods -->
        ${hasMods ? `<Item>
          <filename>dlc_${dlcName.toLowerCase()}:/%PLATFORM%/mods.rpf</filename>
          <fileType>RPF_FILE</fileType>
          <overlay value="false" />
          <disabled value="true" />
          <persistent value="true" />
        </Item>` : ''}

        <!-- Translations -->
        ${hasTranslations ? `<Item>
        <filename>dlc_${dlcName.toLowerCase()}:/common/dlctext.meta</filename>
        <fileType>TEXTFILE_METAFILE</fileType>
        <overlay value="false" />
        <disabled value="true" />
        <persistent value="false" />
      </Item>` : ''}

        <!-- Vehicle Layout Files -->
        ${vehicleLayoutFileNames.map(vehicleLayoutFileName => `<Item>
        <filename>dlc_${dlcName.toLowerCase()}:/common/ai/${vehicleLayoutFileName}</filename>
        <fileType>VEHICLE_LAYOUTS_FILE</fileType>
        <overlay value="false" />
        <disabled value="true" />
        <persistent value="false" />
      </Item>`).join('\n        ')}
      </dataFiles>
      <contentChangeSets>
      <Item>
        <changeSetName>${dlcName.toUpperCase()}_AUTOGEN</changeSetName>
        <filesToDisable />
        <filesToEnable>
            <!-- Audio Files -->
            ${audioGameDataNames.map(audioFileName => `<Item>dlc_${dlcName.toLowerCase()}:/%PLATFORM%/audio/${audioFileName.replace('.dat151', '.dat')}</Item>`).join('\n')}
            ${audioSoundDataNames.map(audioFileName => `<Item>dlc_${dlcName.toLowerCase()}:/%PLATFORM%/audio/${audioFileName.replace('.dat54', '.dat')}</Item>`).join('\n')}
            ${hasSfx ? `<Item>dlc_${dlcName.toLowerCase()}:/%PLATFORM%/audio/sfx/dlc_${dlcName.toLowerCase()}</Item>` : ''}

            <!-- Generic Files -->
            <Item>dlc_${dlcName.toLowerCase()}:/common/vehicles.meta</Item>
            <Item>dlc_${dlcName.toLowerCase()}:/common/carcols.meta</Item>
            <Item>dlc_${dlcName.toLowerCase()}:/common/carvariations.meta</Item>
            <Item>dlc_${dlcName.toLowerCase()}:/common/handling.meta</Item>
            <Item>dlc_${dlcName.toLowerCase()}:/%PLATFORM%/vehicles.rpf</Item>

            <!-- Vehicle Mods -->
            ${hasMods ? `<Item>dlc_${dlcName.toLowerCase()}:/%PLATFORM%/mods.rpf</Item>` : ''}

            <!-- Translations -->
            ${hasTranslations ? `<Item>dlc_${dlcName.toLowerCase()}:/common/dlctext.meta</Item>` : ''}

            <!-- Vehicle Layout Files -->
            ${vehicleLayoutFileNames.map(vehicleLayoutFileName => `<Item>dlc_${dlcName.toLowerCase()}:/common/ai/${vehicleLayoutFileName}</Item>`).join('\n')}
        </filesToEnable>
        <txdToLoad />
        <txdToUnload />
        <residentResources />
        <unregisterResources />
      </Item>
      </contentChangeSets>
      <patchFiles />
    </CDataFileMgr__ContentsOfDataFileXml>`, { collapseContent: true, stripComments: true, lineSeparator: '\n' });
  }
}