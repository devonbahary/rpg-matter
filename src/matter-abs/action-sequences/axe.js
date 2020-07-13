import { animationSelf, playSe, stepLock, weaponPose } from "./utils";
import { WEAPON_POSES } from "../weapon-poses";

const { 
    APPLY_EFFECT,
    STEP_BACKWARD,
    STEP_FORWARD, 
    STEP_NEUTRAL, 
} = Game_Character;

export default {
    AXE: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        16: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.EXTEND), animationSelf(11, true), playSe('Wind7', 90, 60) ],
        18: [ STEP_FORWARD, weaponPose(WEAPON_POSES.DOWN_SWING_AXE), APPLY_EFFECT ],
        35: [],
    },
};