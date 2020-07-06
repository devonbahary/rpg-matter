import { Leaf } from "./types";
import STATUSES from "./statuses";

export class Idle extends Leaf {
    tick() {
        return STATUSES.RUNNING;
    }
}