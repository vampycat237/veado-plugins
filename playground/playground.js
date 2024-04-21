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
        states : document.getElementById("states")
    }

    static controls = {
        connect : document.getElementById("connect"),
        disconnect : document.getElementById("disconnect")
    }

    static controlsOn() {
        connect.style.display = "none";
        disconnect.style.display = "inline-block";

        states.style.display = "block";
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
var chirpCan;


/**
 * Starts listening to Veadotube!
 */
function start() {
    chirpCan = Playground.parseInputs();
}

function stop() {
    chirpCan.close();
}

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