# Vehicle DLC Merger for RageMP / SP

A small utility to merge Vehicle DLCs into a single RPF Structure.

This utility does not create the RPF, but organises all the files in the output to be dragged almost immediately into an RPF created in OpenIV.

If you wish to use this for another multiplayer mod, it will output in Single Player DLC format, so you would have to convert that output. There are probably better tools that already exist for those mods.

## Future Support

- vehiclelayouts.meta

## Usage

- Clone this repository as you would any other, if you don't know how to do this, google it.
- Run `npm install` in a terminal in the root of the project to install dependencies. Try to use NodeJS v16+ if you can!
- Place your existing files from vehicle DLCs into the input folder in the format specified below:

  ```txt
  > input
    > {dlcName}
      > carcols.meta
      > handling.meta
      > vehicles.meta
      > carvariations.meta
      > {audioFile}.dat151.rel
      > {audioFile}.dat54.rel
      > vehicles
        > {vehicleName}.yft (and _hi)
        > {vehicleName}.ytd (and +hi if you have one)
        > ... add all your vehicle mesh and texture dictionaries in here
      > mods (if you have any)
        > {modName}.yft
        > {modName}.ytd
        > {modName}.ydr
        > ... add all your mods in here
      > sfx (if the audio folder has any)
        > {sfxName}.awc
        > ... add all the audio/sfx files here

  ```

  If you do not use this format, it will not work. If you do not have a specific file, like `handling.meta`, then you can ignore it
- Update `src/config.js` to contain the `dlcName` you wish to use. This has to be unique and cannot match any other DLC pack you have
- Run `npm start`
- Wait...
- In the `output` folder will be the format and files needed to create the DLC pack in OpenIV.

## OpenIV

This one is really simple:

- Create a new `dlc.rpf` in OpenIV
- Move the files from `output` into the dlc.rpf
- For `vehicles.rpf` and `mods.rpf`, if they exist, you will need to create a new RPF inside the `dlc.rpf` with those names, and drag the files from within those folders to the new RPFs you created.
- Put the DLC wherever you normally do to use it, it should now have all if your Vehicle DLCs into the same DLCPack.

## Notes

Keep these in mind:

- There is a limit on DLC Pack Size, of about 4GB (I think, correct me if I'm wrong!)
- There is a limit on the number of DLCPacks you can have in GTA (which is why I created this, even gameconfig mod can only take it so far)
- There is a good reason to merge dlcs - lots of smaller dlcs take longer to download vs a single larger one. The downside is changing or adding a single vehicle requires redownloading of the entire dlcpack, not just the new or updated dlcpack.
- There may be specific things that are missing from this Utility - if you notice them, open an issue with the Original XML file. Alternatively, submit a Pull Request extending the functionality of this utility!

## FAQ

These have been asked, don't ask again please.

- > Why don't you use GTAUtil to automatically create the RPF?
  Because it does not work correctly all the time, sometimes creating dlcs that are corrupted
- > Why don't you use GTAUtil to unpack DLCs instead of requiring that format?
  Same reason as above, GTAUtil doesn't always work unfortunately. The little bit of manual labour is much better than the lots you'd otherwise have to do, right? :P
- > Why does this not support language files included with some mods?
  I created this while developing my RP server ([https://eternalrage.net/](EternalRage)) and I do not show these native ui pieces. I may add support for this in future, but feel free to open a pull request if you add support yourself!
