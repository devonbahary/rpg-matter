export const STATUSES = {
    SUCCESS: 0,
    FAILURE: 1,
    RUNNING: 2,
};

export class Selector {
    constructor(children) {
        this.children = children;
    }

    tick() {
        let activeChildIndex = 0;
        while (activeChildIndex < this.children.length) {
            const activeChild = this.children[activeChildIndex];
            const childStatus = activeChild.tick();
            
            switch (childStatus) {
                case STATUSES.SUCCESS:
                    return STATUSES.SUCCESS; // exit as soon as a child succeeds
                case STATUSES.FAILURE:
                    activeChildIndex++;
                    break;
                case STATUSES.RUNNING:
                    return STATUSES.RUNNING;
                default:
                    throw new Error(`selector can't process child status ${childStatus}`);
            }
        }
    }
}

export class Sequence {
    constructor(children) {
        this.activeChildIndex = 0;;
        this.children = children;
    }

    reset() {
        if (this.children[this.activeChildIndex]) this.children[this.activeChildIndex].reset();
    }

    tick() {        
        let activeChildIndex = 0;
        while (activeChildIndex < this.children.length) {
            const activeChild = this.children[activeChildIndex];
            const childStatus = activeChild.tick();

            switch (childStatus) {
                case STATUSES.SUCCESS:
                    activeChildIndex++;
                    break;
                case STATUSES.FAILURE:
                    return STATUSES.FAILURE; // all children must succeed for a Sequence to succeed
                case STATUSES.RUNNING:
                    return STATUSES.RUNNING;
                default:
                    throw new Error(`sequence can't process child status ${childStatus}`);
            }   
        }
    }
}

export class Leaf {
    constructor(battler) {
        this.battler = battler;
    }

    get action() {
        return this.battler.pursuedAction;
    }

    get target() {
        if (this.action.isForOpponent()) return this.battler.topAggroBattler();
        return null;
    }
}