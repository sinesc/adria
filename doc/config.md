adria
=====

- <a href="//github.com/sinesc/adria/blob/master/README.md">Readme</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/overview.md">Language overview</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/modules.md">Module handling</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/commandline.md">Commandline options</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/config.md">Build configurations</a>

Build configuration
-------------------

Instead of accepting build options via command line, Adria can also read build-configuration files.
Configuration files offer the same functionality as the commandline does but can also depend on
other configurations.

#### Creating a build configuration

Add `--write-config [ <filename> ]` to your build-commandline to generate a build-configuration for
the given compiler arguments. The resulting JSON-file `<filename>.abc` can then easily be modified.
If no filename was given, the file will be named `build.abc`.

#### Loading a configuration

To use the configuration for a build, run adria with `-c [ <filename> ]`. If no filename was given,
the compiler will attempt to load `build.abc`.

#### Depending on another configuration

By adding a `depend` key to the configuration's JSON object, the compiler can be instructed to
merge the given configuration file. The filename must include the file's extension, if any was used.

#### Example configuration

dist.abc

```
{
    "depend": "version.inc",
    "debug": false,
    "mode": "adria",
    "stdin": false,
    "cache": true,
    "files": [
        "main.adria"
    ],
    "outFile": "../bin/ngadria.js",
    "basePath": "src/",
    "paths": [
        "../../astdlib/"
    ],
    "extension": ".adria",
    "platform": "node",
    "headerFile": "../LICENSE",
    <...>
}
```

version.inc

```
{
    "defines": {
        "version": "0.2.2"
    }
}
```