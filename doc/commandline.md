adria
=====

- <a href="//github.com/sinesc/adria/blob/master/README.md">Readme</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/overview.md">Language overview</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/framework.md">Minimal default framework</a>
- Commandline options

Commandline options
-------------------

### General syntax

`adria [ options ] file1 [ file2 [ file3 ... ] ]`

### Common options

Command                 | Description
------------------------|------------------------------------------------------------
`--target <target>`     | sets the transcompilation target. currently supported:
                        | `adria`         compile from adria to javascript
                        | `adriadebug`    compile from adria to AST-XML
`--pipe`                | read from stdin instead of or in addtition to a file
`--base <path>`         | sets project root path (set by shell script to cwd)
`--path <path>`         | additional include path to look for files (for multiple paths, use `--path` each time)
`--out <filename>`      | output filename, relative to base

### Targets adria and adriadebug

Command                     | Description
----------------------------|------------------------------------------------------------
`--file-extension <string>` | default file extension to use when none is given (excluding dot)
`--no-framework`            | plain output, don't wrap in application/module code
`--platform <web/node>`     | `node`: include relative requires only, don't overwrite node's require function
                            | `web`: include all requires
`--no-map`                  | don't write sourcemap
`--no-link`                 | don't link sourcemap to generated Javascript
`--tweak-exports`           | add exports variable to module scope (CommonJS compatibility)
`--tweak-nostrict`          | don't generate strict-mode code