# VS-Wollemi

[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/version-short/jamesjarvis.vs-wollemi.svg)](https://marketplace.visualstudio.com/items?itemName=jamesjarvis.vs-wollemi)

This is a simple VSCode wrapper around [Wollemi](https://github.com/tcncloud/wollemi) that runs wollemi each time a `go` or `plz BUILD` file is saved.

## Features

Will run wollemi (a helper for writing plz BUILD files) on save.

## Requirements

- [Wollemi](https://github.com/tcncloud/wollemi)
- [Please](https://github.com/thought-machine/please)

It's possible to use wollemi through a plz alias command, so I would recommend instally plz and optionally wollemi.
If you are using wollemi through a plz alias command, change the `vs-wollemi.wollemiCommand` setting to your alias command (eg: `plz wollemi`).

## Extension Settings

This extension contributes the following settings:

- `vs-wollemi.runOnSave`: enable/disable this extension
- `vs-wollemi.autoClearConsole`: clears the "output" console before each run
- `vs-wollemi.wollemiCommand`: command to trigger `wollemi` (you won't need to change this if you are using the wollemi tool directly)
- `vs-wollemi.shell`: shell to execute the command with, probably don't bother changing this.

## Known Issues

1. I haven't bothered implementing the tests yet.
2. Might not work on windows due to \ paths? Let me know if it does not.

## Release Notes

### 0.0.1

Initial release of vs-wollemi, will run `${wollemi} fmt ${path}` on save and atm that's all I need to stay tuned for potential updates...
