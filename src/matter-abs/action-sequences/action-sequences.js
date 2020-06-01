import { WEAPON_POSES } from "../weapon-poses";
import { convertActionSequencesToCommands } from "./utils";
import "../characters/Game_Character";

const { 
    APPLY_EFFECT,
    ROUTE_PLAY_SE, 
    STEP_BACKWARD,
    STEP_FORWARD, 
    STEP_LOCK, 
    STEP_NEUTRAL, 
    WEAPON_POSE,
} = Game_Character;

const command = (code, ...parameters) => ({ code, parameters });
const playSe = (name, volume = 90, pitch = 100) => command(ROUTE_PLAY_SE, { name, volume, pitch });
const stepLock = lock => command(STEP_LOCK, lock); 
const weaponPose = pose => command(WEAPON_POSE, pose);

const ACTION_SEQUENCES = {
    SWING: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        7: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.EXTEND), APPLY_EFFECT ],
        15: [ STEP_FORWARD, weaponPose(WEAPON_POSES.DOWN_SWING) ],
        20: [ stepLock(false) ],
    },
};

export default convertActionSequencesToCommands(ACTION_SEQUENCES);