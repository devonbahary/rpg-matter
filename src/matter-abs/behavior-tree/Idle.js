import { Leaf, STATUSES } from "./types";

export class Idle extends Leaf {
    tick() {
        return STATUSES.RUNNING;
    }
}