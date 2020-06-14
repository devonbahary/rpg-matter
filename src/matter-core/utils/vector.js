import { Vector } from "matter-js";
import MATTER_CORE from "../pluginParams";

export const vectorFromAToB = (a, b) => Vector.add(b, Vector.neg(a));
export const vectorLengthFromAToB = (a, b) => Vector.magnitude(vectorFromAToB(a, b));

export const toWorldVector = ({ x, y }) => ({
    x: x * MATTER_CORE.TILE_SIZE,
    y: y * MATTER_CORE.TILE_SIZE,
});

export const toWorldVectorCentered = ({ x, y }) => ({
    x: x * MATTER_CORE.TILE_SIZE + (MATTER_CORE.TILE_SIZE / 2),
    y: y * MATTER_CORE.TILE_SIZE + (MATTER_CORE.TILE_SIZE / 2),
});

export const vectorResize = (v, scalar) => {
    const normalisedVector = Vector.normalise(v);
    return Vector.mult(normalisedVector, scalar);
};