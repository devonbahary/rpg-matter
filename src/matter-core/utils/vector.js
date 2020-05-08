import { Vector } from "matter-js";

export const vectorFromAToB = (a, b) => {
    return Vector.add(a, Vector.neg(b));
};
