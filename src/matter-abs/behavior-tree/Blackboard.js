export default class Blackboard {
    constructor() {
        this._battlerToAttackersMap = {};
    }

    isBattlerBeingAttacked(battler) {
        return this._battlerToAttackersMap[battler.id] && this._battlerToAttackersMap[battler.id].length;
    }

    setAttackingBattler(attacker, battler) {
        if (!this._battlerToAttackersMap[battler.id]) {
            this._battlerToAttackersMap[battler.id] = [ attacker.id ];
        } else if (!this._battlerToAttackersMap[battler.id].includes(attacker.id)) {
            this._battlerToAttackersMap[battler.id].push(attacker.id);
        }
    }

    clearAttackingBattler(attacker) {
        for (const battlerId in this._battlerToAttackersMap) {
            const attackers = this._battlerToAttackersMap[battlerId];
            if (attackers.includes(attacker.id)) {
                if (attackers.length === 1) {
                    delete this._battlerToAttackersMap[battlerId];
                } else if (attackers.length) {
                    this._battlerToAttackersMap[battlerId] = attackers.filter(attackerId => attackerId !== attacker.id);
                }
            }
        }
    }
}