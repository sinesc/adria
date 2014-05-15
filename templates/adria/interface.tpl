
{*
 * ___module refers to a possible outside "module" variable used by module loaders
 * if no "module" was present, ___module will be a dummy with one property "___nomodule"
 *
 * the adria module containing the interface statement will already have set ___module.exports, so
 * we only need to handle the AMD and lack of module loader cases here
 *}

if(typeof ___define == 'function' && typeof ___define.amd == 'object' && ___define.amd) {

    ___define(function() {
        return ___module.exports;
    });

} else if (___module.___nomodule) {

    {* ___nomodule set by transform::mergeAll, no module loader found *}

    {! if (interfaceName !== ''): !}
    window["{% interfaceName %}"] = ___module.exports;
    {! endif !}
}