import { animationSelf, playSe, stepLock, weaponPose } from "./utils";
import { WEAPON_POSES } from "../weapon-poses";

const { 
    APPLY_EFFECT,
    ROUTE_DIR_FIX_ON: DIR_FIX_ON,
    ROUTE_DIR_FIX_OFF: DIR_FIX_OFF,
    ROUTE_MOVE_FORWARD: MOVE_FORWARD,
    ROUTE_TURN_90D_L: TURN_90_L,
    ROUTE_TURN_90D_R: TURN_90_R,
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
    WILD_SWING: {
        1: [ stepLock(true), STEP_BACKWARD, TURN_90_L, weaponPose(WEAPON_POSES.EXTEND), animationSelf(33, true), playSe('Wind7', 90, 50), DIR_FIX_ON ],
        6: [ DIR_FIX_OFF, TURN_90_R, weaponPose(WEAPON_POSES.EXTEND), DIR_FIX_ON ],
        7: APPLY_EFFECT,
        8: [ weaponPose(WEAPON_POSES.SIDE) ],
        15: [ DIR_FIX_OFF, TURN_90_R, DIR_FIX_ON ],
        22: [ DIR_FIX_OFF, TURN_90_R, DIR_FIX_ON ],
        30: [ DIR_FIX_OFF, TURN_90_R, DIR_FIX_ON ],
        60: [],
    },
    },
    
};