import MATTER_CORE from "./matter-core/pluginParams";

export function getMassFromMeta(mass) {
    if (parseInt(mass)) return parseInt(mass);
    if (mass) return MATTER_CORE.CHARACTER_MASSES[mass.trim()];
    return null;
};

export function getBooleanFromMeta(boolean) {
    return boolean ? JSON.parse(boolean) : false;
};

export const transformPluginStruct = pluginParam => {
    const struct = JSON.parse(pluginParam);
    return Object.entries(struct).reduce((acc, [ key, val ]) => {
        acc[key.toUpperCase()] = Number(val);
        return acc;
    }, {});
};