import MATTER_CORE from "./matter-core/pluginParams";

export function getMassFromMeta(mass) {
    if (parseInt(mass)) return parseInt(mass);
    if (mass) return MATTER_CORE.CHARACTER_MASSES[mass.trim()];
    return null;
};