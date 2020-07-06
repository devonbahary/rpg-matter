import { Leaf } from "./types";
import STATUSES from "./statuses";

export class HasAction extends Leaf {
    tick() {
        if (this.battler.hasAction()) return STATUSES.SUCCESS;
        return STATUSES.FAILURE;
    }
}