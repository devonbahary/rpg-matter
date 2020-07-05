import { Selector } from "./types";
import { Act } from "./Act";
import { Idle } from "./Idle";

export default class Root extends Selector {
    constructor(battler) {
        super([
            new Act(battler),
            new Idle(),
        ]);
    }
}