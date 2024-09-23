const InputMode = {
    MANUAL : "manual",
    FILE : "file"
}

/**
 * Holds element information. Only add to this as we actually need to reference them!
 */
class Playground {
    /**
     * TRUE = Input mode is MANUAL
     * FALSE = Input mode is FILE
     */
    static inputMode = InputMode.MANUAL;

    static inputs = {
        // INPUT MODE: Manual
        manual : [
            new Input("host", '127.0.0.1'), //0
            new Input("port"), //1

            new Input("window-title", 'veadotube mini') //2
        ],
        // INPUT MODE: File
        file : [
            new Input("instances-file")
        ]
        
    }

    static containers = {
        states : document.getElementById("states-target")
    }

    static controls = {
        connect : document.getElementById("connect"),
        disconnect : document.getElementById("disconnect")
    }

    static controlsOn() {
        connect.style.display = "none";
        disconnect.style.display = "inline-block";

        states.style.display = "flex";
    }

    static controlsOff() {
        connect.style.display = "inline-block";
        disconnect.style.display = "none";

        states.style.display = "none";
    }

    /**
     * Runs tests on each input value to ensure validity, indicates to user if any are not valid.
     */
    static parseInputs() {
        switch (Playground.inputMode) {
    
            case InputMode.MANUAL:
                // INPUT MODE: Manual
                // Validation step
                for (var i = 0; i < Playground.inputs.manual.length; i++) {
                    if (!Playground.inputs.manual[i].validate()) {
                        // If any step fails to validate, stop execution, log error to console
                        console.error(`Failed to start up. Reason: Invalid input for ${Playground.inputs.manual[i].id}: '${Playground.inputs.manual[i].getValue()}'`);
                        return;
                    }
                    console.log(`${Playground.inputs.manual[i].id}: '${Playground.inputs.manual[i].getValue()}'`);
                }
    
                // Parsing step
                const host = Playground.inputs.manual[0].getValue();
                const port = Playground.inputs.manual[1].getValue();
                const server = host + ":" + port;
    
                const windowTitle = Playground.inputs.manual[2].getValue();

    
                return new ChirpCan(server, windowTitle);
    
            case InputMode.FILE:
                console.error("Failed to start up. Reason: File reading not yet implemented");
                return;
        }
    }
}


// init stuff
var chirpCans = [];
const inspector = new Inspector("itarget-title", "itarget-desc");


/**
 * Starts listening to Veadotube!
 */
function start() {
    chirpCans[chirpCans.length] = Playground.parseInputs();
}

/**
 * Stops the given ChirpCan's communications, or all ChirpCans
 * @param {number} index (Optional) Index of the ChirpCan to stop
 */
function stop(index = null) {
    if (index == null) {
        for (var i = 0; i < chirpCans.length; i++) {
            chirpCans[i].close();
        }
    }
    else chirpCans[index].close();
}

/**
 * Toggles whether the config is accepting manual or file input.
 */
function toggleInputMode() {
    switch (Playground.inputMode) {
        case InputMode.MANUAL:
            Playground.inputMode = InputMode.FILE;
            break;
        case InputMode.FILE:
            Playground.inputMode = InputMode.MANUAL;
            break;
    }
    $( '.config-input-mode' ).toggle(); 
}

function loadInspectorData() {
    const e = document.getElementsByClassName("inspector-data");
    /** Bunch of loop variables. */
    let title, pages;
    let tmpBundle;

    // loop thru html collection and add shit
    for (let i = 0; i < e.length; i++) {
        // inspecting bundle i
        // String: bundle title
        title = e[i].getElementsByClassName("inspectable-bundle-title")[0].value;

        // Create bundle i
        tmpBundle = new InspectorInfoBundle(title);

        // HTML Collection of pages
        pages = e[i].getElementsByClassName("inspector-page");

        for (let j = 0; j < pages.length; j++) {
            // inspecting each page (j) of bundle i: push 
            tmpBundle.pushPage(pages[j].getElementsByClassName("inspectable-title")[0].value, pages[j].getElementsByClassName("inspectable-desc")[0].value);
        }

        // all pages added
        inspector.addToLibrary(tmpBundle); // save contents of tmpBundle
        tmpBundle = null; // discard this reference to tmpBundle
    }
}

loadInspectorData();