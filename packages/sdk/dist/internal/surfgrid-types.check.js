/** Compile-time contract for the generated surfgrid option overloads. */
function checkSurfaceBufferTypes(core, optionalCompact, nullableCompact) {
    const args = ["{}", "roofs", 2, 0.1, 10n];
    const omitted = core.synthesizeSurfaces(...args);
    const legacy = core.synthesizeSurfaces(...args, null, null, null, true, false);
    const compact = core.synthesizeSurfaces(...args, null, null, null, true, true);
    const either = core.synthesizeSurfaces(...args, null, null, null, true, optionalCompact);
    const nullOption = core.synthesizeSurfaces(...args, null, null, null, null, null);
    const nullable = core.synthesizeSurfaces(...args, null, null, null, true, nullableCompact);
    void [omitted, legacy, compact, either, nullOption, nullable];
}
export {};
