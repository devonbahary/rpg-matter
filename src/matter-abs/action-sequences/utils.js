import { times } from "lodash";

export const adjustFrames = (actionSequence, byFrames) => {
    return Object.entries(actionSequence).reduce((acc, [ frame, commands ]) => {
        acc[parseInt(frame) + byFrames] = commands;
        return acc;
    }, {});
};

export const convertActionSequencesToCommands = actionSequences => {
    return Object.entries(actionSequences).reduce((acc, [ ACTION_SEQ_KEY, SEQUENCE ]) => {
        acc[ACTION_SEQ_KEY] = Object.entries(SEQUENCE).reduce((acc, [ frame, commands ]) => {
            // convert each defined frame as an array of commands if not already
            if (!Array.isArray(commands)) commands = [ commands ];

            // convert each command into a command object if not already
            acc[frame] = commands.map(command => {
                if (typeof command === 'object') return command;
                
                return {
                    code: command,
                    parameters: [],
                };
            });

            return acc;
        }, {})
        return acc;
    }, {});
};

const { 
    ANIMATION_SELF,
    ANIMATION_WEAPON,
    ROUTE_PLAY_SE, 
    STEP_LOCK, 
    WEAPON_POSE,
} = Game_Character;

const command = (code, ...parameters) => ({ code, parameters });
export const playSe = (name, volume = 90, pitch = 100) => command(ROUTE_PLAY_SE, { name, volume, pitch });
export const animationSelf = (animationId, rotateWithCharacter) => command(ANIMATION_SELF, animationId, rotateWithCharacter);
export const animationWeapon = (animationId, rotateWithCharacter) => command(ANIMATION_WEAPON, animationId, rotateWithCharacter);
export const stepLock = lock => command(STEP_LOCK, lock); 
export const weaponPose = pose => command(WEAPON_POSE, pose);
export const n = (command, n) => times(n, () => command);