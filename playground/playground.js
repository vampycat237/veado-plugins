/**
 * Holds element information. Only add to this as we actually need to reference them!
 */
class Playground {
    static inputs = {
        host : document.getElementById("host"),
        port : document.getElementById("port"),
        windowTitle: document.getElementById("window-title"),

        instancesFile: document.getElementById("instances-file")
    }

    static containers = {
        states : document.getElementById("states")
    }
}


// init stuff
var chirpCan;

/**
 * Starts listening to Veadotube!
 */
function setupPlayground() {
    chirpCan = new ChirpCan();
}