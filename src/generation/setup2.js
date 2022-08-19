const formatXml = require('xml-formatter');

module.exports = {
  generateSetupFile: function (dlcName) {
    return formatXml(`<?xml version="1.0" encoding="UTF-8"?>
    <SSetupData>
      <deviceName>dlc_${dlcName.toLowerCase()}</deviceName>
      <datFile>content.xml</datFile>
      <timeStamp>08/08/2022 17:06:23</timeStamp>
      <nameHash>${dlcName.toLowerCase()}</nameHash>
      <contentChangeSetGroups>
        <Item>
          <NameHash>GROUP_STARTUP</NameHash>
          <ContentChangeSets>
            <Item>${dlcName.toUpperCase()}_AUTOGEN</Item>
          </ContentChangeSets>
        </Item>
      </contentChangeSetGroups>
      <type>EXTRACONTENT_LEVEL_PACK</type>
      <order value="56" />  
      <minorOrder value="0" />
      <isLevelPack value="true" />
      <dependencyPackHash />
      <requiredVersion />
      <subPackCount value="0" />
    </SSetupData>`, { collapseContent: true, stripComments: true, lineSeparator: '\n' });
  }
}