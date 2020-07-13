import STATUSES from "./statuses";

export class Selector {
    constructor(behaviorTree, children) {
        this.children = children.map(child => new child(behaviorTree));
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

        return STATUSES.FAILURE;
    }
}

export class Sequence {
    constructor(behaviorTree, children) {
        this.children = children.map(child => new child(behaviorTree));
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

        return STATUSES.SUCCESS;
    }
}

export class Leaf {
    constructor(behaviorTree) {
        this.behaviorTree = behaviorTree;
        this.battler = this.behaviorTree.battler;
    }

    get action() {
        return this.battler.currentAction() || this.battler.pursuedAction;
    }

    get target() {
        if (!this.action) return null;
        if (this.action.isGuard()) return this.battler.topAggroBattler();
        if (this.action.isForUser()) return this.battler;
        if (this.action.isForOpponent()) return this.battler.topAggroBattler();
        if (this.action.isForFriend()) {
            return this.battler.lowestHpRateFriendInMentalMap();
        }
        return null;
    }
}