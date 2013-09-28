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
`--target <target>`     | sets the transcompilation target. currently supported:
                        | `adria`         compile from adria to javascript
                        | `adriadebug`    compile from adria to an XML-like representation of the AST
`--pipe`                | read from stdin instead of or in addtition to a file
`--base <path>`         | sets project root path (set by shell script to cwd)
`--path <path>`         | additional include path to look for files. paths are relative to base, for multiple paths, use `--path` each time
`--out <filename>`      | output filename, relative to base

### Targets adria and adriadebug

Command                     | Description
----------------------------|------------------------------------------------------------
`--assert`                  | enables runtime assertions via the `assert` statement. unless enabled, assertions will not be included in the generated source
`--platform <web/node>`     | `node`: required when generated code is to be run in a nodeJS environment
                            | `web`: required when generated code is to be run in a webbrowser environment
`--no-closure`              | don't wrap entire output in a closure
`--no-application`          | don't include `application`
`--no-scan`                 | don't check for undefined variables
`--no-map`                  | don't write sourcemap
`--no-link`                 | don't link sourcemap to generated Javascript
`--tweak-exports`           | add exports variable to module scope (CommonJS compatibility)
`--tweak-nostrict`          | don't generate strict-mode code
`--file-extension <string>` | default file extension to use when none is given (excluding dot)