const MATTER_CORE = {};

MATTER_CORE.BASE_MOVE_SPEED = 0.25 / (8 - parseInt(PluginManager.parameters('MatterCore')["Base Move Speed"]));
MATTER_CORE.DASH_SPEED_BOOST = Number(PluginManager.parameters('MatterCore')["Dash Speed Boost"]);
MATTER_CORE.EVENT_TOUCH_COOLDOWN = Number(PluginManager.parameters('MatterCore')["Touch Event Cooldown"]);
MATTER_CORE.INTERACTION_RADIUS = Number(PluginManager.parameters('MatterCore')["Interaction Radius"]);
MATTER_CORE.IS_CLICK_TO_MOVE_DASH = JSON.parse(PluginManager.parameters('MatterCore')["Click To Move Dash"]);
MATTER_CORE.PLAYTEST_IS_TIMESCALE_ADJUST = JSON.parse(PluginManager.parameters('MatterCore')["Playtest Timescale On Button Press"]);
MATTER_CORE.PLAYTEST_TIMESCALE = Number(PluginManager.parameters('MatterCore')["Playtest Timescale"]);
MATTER_CORE.PLAYTEST_TIMESCALE_KEY_CODE = Number(PluginManager.parameters('MatterCore')["Playtest Timescale Key Code"]);
MATTER_CORE.RENDER_IS_DISPLAY = JSON.parse(PluginManager.parameters('MatterCore')["Display Render"]);
MATTER_CORE.RENDER_HEIGHT = parseInt(PluginManager.parameters('MatterCore')["Render Height"]);
MATTER_CORE.RENDER_WIDTH = parseInt(PluginManager.parameters('MatterCore')["Render Width"]);
MATTER_CORE.TILE_SIZE = parseInt(PluginManager.parameters('MatterCore')["Tile Size"]);

const CHARACTER_MASSES = JSON.parse(PluginManager.parameters('MatterCore')["Character Masses"]);
const formattedCharacterMasses = Object.entries(CHARACTER_MASSES).reduce((acc, [ key, val ]) => {
    acc[key] = parseInt(val);
    return acc;
}, {});;
MATTER_CORE.CHARACTER_MASSES = formattedCharacterMasses;

const CHARACTER_DEFAULT_MASS = PluginManager.parameters('MatterCore')["Default Character Mass"];
MATTER_CORE.CHARACTER_DEFAULT_MASS = formattedCharacterMasses[CHARACTER_DEFAULT_MASS];

export default MATTER_CORE;