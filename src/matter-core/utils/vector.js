import { Vector } from "matter-js";

export const vectorFromAToB = (a, b) => Vector.add(b, Vector.neg(a));
export const vectorLengthFromAToB = (a, b) => Vector.magnitude(vectorFromAToB(a, b));