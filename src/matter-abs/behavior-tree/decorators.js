import STATUSES from "./statuses";

export const Inverter = Node => {
    return class ExtendsNode extends Node {
        tick() {
            const status = super.tick();
            switch (status) {
                case STATUSES.SUCCESS:
                    return STATUSES.FAILURE;
                case STATUSES.FAILURE:
                    return STATUSES.SUCCESS;
                default:
                    return status;
            }
        }
    }
};