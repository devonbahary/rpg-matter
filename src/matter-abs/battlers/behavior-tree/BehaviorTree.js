import { Root } from "./sequences";

// Game_Battler.prototype.updateEligibleActions = function() {
//     const eligibleActions = this.getEligibleActions();
//     const serializedEligibleActions = JSON.stringify(eligibleActions);

//     if (serializedEligibleActions !== this._eligibleActionsMem) {
//         this._eligibleActionsMem = serializedEligibleActions;

//         const ratingZero = this.getRatingZeroForActions(eligibleActions);
//         const action = this.selectAction(eligibleActions, ratingZero);

//         this._pursuedAction = action ? $dataSkills[action.skillId] : null;
//     }
// };

class Node {
    constructor({ battler, behaviorTree, parent, returnCondition }) {
        this.behaviorTree = behaviorTree;
        this.battler = battler;
        this.parent = parent;
        this.returnCondition = returnCondition;
    }

    reset() {
        this.behaviorTree.reset();
    }

    tick() {
        if (this.returnCondition && this.returnCondition()) this.behaviorTree.setActiveNode(this.parent); 
    }
}

export default class BehaviorTree { // a.k.a "root node"
    constructor(battler) {
        this.battler = battler;
        this.dataSkill = null;
        this.child = null;
    }

    reset() {
        this.dataSkill = null;
    }

    determineAction() {
        const actions = this.battler.getEligibleActions();
        const ratingZero = this.battler.getRatingZeroForActions(actions);
        const action = this.battler.selectAction(actions, ratingZero);
        if (action) return $dataSkills[action.skillId];
        return null;
    }

    tick() {
        if (!this.dataSkill) {
            this.dataSkill = this.determineAction();
            if (!this.dataSkill) return;
            const action = new Game_ActionABS(this.battler, this.dataSkill);
            this.child = new Root(this.battler, action);
        }

        this.child.tick();
    }
};