const MATTER_PLUGIN = {};

MATTER_PLUGIN.BASE_MOVE_SPEED = 1 / (8 - parseInt(PluginManager.parameters('Matter')["Base Move Speed"]));
MATTER_PLUGIN.DASH_SPEED_BOOST = Number(PluginManager.parameters('Matter')["Dash Speed Boost"]);
MATTER_PLUGIN.INTERACTION_RADIUS = Number(PluginManager.parameters('Matter')["Interaction Radius"]);
MATTER_PLUGIN.RENDER_IS_DISPLAY = JSON.parse(PluginManager.parameters('Matter')["Display Render"]);
MATTER_PLUGIN.RENDER_WIDTH = parseInt(PluginManager.parameters('Matter')["Render Width"]);
MATTER_PLUGIN.RENDER_HEIGHT = parseInt(PluginManager.parameters('Matter')["Render Height"]);
MATTER_PLUGIN.TILE_SIZE = parseInt(PluginManager.parameters('Matter')["Tile Size"]);

export default MATTER_PLUGIN;