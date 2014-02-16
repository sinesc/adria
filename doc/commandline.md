adria
=====

- <a href="//github.com/sinesc/adria/blob/master/README.md">Readme</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/overview.md">Language overview</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/modules.md">Module structure</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/commandline.md">Commandline options</a>

Commandline options
-------------------

### General syntax

`adria [ options ] file1 [ file2 [ file3 ... ] ]`

### Common options

Command                 | Description
------------------------|------------------------------------------------------------
`--mode <mode>`         | sets the transcompilation mode. currently supported:
                        | `adria`         compile from adria to javascript, default
                        | `adriadebug`    compile from adria to an XML-like representation of the AST
`--stdin`               | read from stdin instead of or in addtition to a file (false)
`--cache`               | enable compiler cache (true)
`--debug`               | enable debug output (false)
`--help`                | commandline help output

### Targets adria and adriadebug

Command                     | Description
----------------------------|------------------------------------------------------------
`--base <path>`             | sets project root path
`--path <path>`             | additional include path to look for files. paths are relative to base, for multiple paths, use `--path` each time
`--out <filename>`          | output filename, relative to base
`--assert`                  | enables runtime assertions via the `assert` statement. unless enabled, assertions will not be included in the generated source (false)
`--target <web/node>`       | `node`: required when generated code is to be run in a nodeJS environment, default
                            | `web`: required when generated code is to be run in a webbrowser environment
`--closure`                 | wrap entire output in a closure (true)
`--application`             | include `application` (true)
`--scan`                    | check for undefined variables (true)
`--map`                     | write sourcemap (true)
`--link`                    | link sourcemap to generated Javascript (true)
`--strict`                  | generate strict-mode code (true)
`--extension <string>`      | default file extension to use when none is given (adria)