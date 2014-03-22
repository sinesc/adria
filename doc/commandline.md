adria
=====

- <a href="//github.com/sinesc/adria/blob/master/README.md">Readme</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/overview.md">Language overview</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/modules.md">Module handling</a>
- <a href="//github.com/sinesc/adria/blob/master/doc/commandline.md">Commandline options</a>

Commandline options
-------------------

Command line help is available via the --help switch. By default this will print the arguments available for mode=adria, use `adria -m <mode> --help` to get
help for `<mode>`

```
usage: adria [-v] [-d] [-m {adria,adriadebug}] [--stdin] [--cache] [-o <file>]
             [-b <path>] [-p <path>] [--extension <ext>] [-t {node,web}]
             [--header <file>] [-D <key>=<value>] [--shellwrap]
             [--shellargs <args>] [--monitor] [--strict] [--es5] [--assert]
             [--scan] [--map] [--link] [--time] [-h]
             files [files ...]

Positional arguments:
  files                 File(s) to compile

Optional arguments:
  -v, --version         Show program's version number and exit.
  -d, --debug           Enable debug mode (false)
  -m {adria,adriadebug}, --mode {adria,adriadebug}
                        Translation mode (adria)
  --stdin               Read from stdin (false)
  --cache               Cache generated code (true)
  -o <file>, --out <file>
                        Output file
  -b <path>, --base <path>
                        Base path, include paths are relative to this
  -p <path>, --path <path>
                        Additional path to look for includes
  --extension <ext>     Adria file extension (adria)
  -t {node,web}, --target {node,web}
                        Platform to generate code for (node)
  --header <file>       File to include as commentblock before output
  -D <key>=<value>, --define <key>=<value>
                        Define preprocessor value, i.e. version="1.2"
  --shellwrap           Wrap in shell-script and flag executable (false)
  --shellargs <args>    Arguments for shellwrap to pass to runtime. Use
                        --shellargs="..." syntax.
  --monitor             Don't exit after compilation, watch for and rebuild
                        on file changes (false)
  --strict              Compile strict Javascript (true)
  --es5                 Compile to ES5 (false)
  --assert              Add assert() support (false)
  --scan                Perform basic logic checks (true)
  --map                 Generate source map (false)
  --link                Link sourcemap to output (true)
  --time                Report compilation duration (false)
  -h, --help            Show this help message and exit.

Use --no-... to invert option switches, i.e. --no-strict
```
