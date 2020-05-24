import { MATTER_ABS } from "./MatterActionBattleSystem";

function battlerSetupError(msg) {
    throw new Error(msg + ` for event ID ${this.eventId()}`);
};

function battlerIdFromPage(regex) {
    return this.pageComments().reduce((battlerId, comment) => {
        const match = comment.match(regex);
        if (match && battlerId) {
            battlerSetupError.call(this, `found multiple battler IDs in single page`);
        } else if (match) {
            return match[1];
        }
        return battlerId;
    }, 0);
};

export function battlerFromPage(battlerType) {
    let actor, enemy;
    for (battlerType of [ 'actor', 'enemy' ]) {
        let dataset, regex;
        switch (battlerType) {
            case 'actor':
                dataset = $dataActors;
                regex = MATTER_ABS.EVENT_TAG_REGEX_ACTOR_ID;
                break;
            case 'enemy':
                dataset = $dataEnemies;
                regex = MATTER_ABS.EVENT_TAG_REGEX_ENEMY_ID;
                break;
            default:
                throw new Error(`invalid argument ${battlerType} for battlerType; must be 'actor' or 'enemy'`);
        }
    
        const battlerId = battlerIdFromPage.call(this, regex);
        if (!battlerId) continue;
    
        const battler = dataset[battlerId];
        if (!battler) battlerSetupError.call(this, `cannot create ${battlerType} with ${battlerType} ID ${battlerId}`);
    
        if (battlerType === 'actor') actor = new Game_Actor(battlerId);
        else if (battlerType === 'enemy') enemy = new Game_Enemy(battlerId);
    }
    
    if (actor && enemy) battlerSetupError.call(this, `found both actor and enemy IDs in single page`);
    return actor || enemy;
}