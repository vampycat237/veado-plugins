/**
 * Talk to Veadotube... but in JS! Because, surely, people want to do that... Right?
 */
class ChirpCan {
    static msg = {
        requestNodeList : {
            event: "list"
        },

        requestStateList: {
            event: "payload",
            type: "stateEvents",
            id: "mini",
            payload: { event: "list" }
        }

    }

    static states = []


    // Gets config info from HTML and starts communication with the websocket server
    constructor(server, windowTitle) {
        this.server = server;
        this.windowTitle = windowTitle;

        console.log("connecting...");

        //TODO: Try connecting to websocket
        this.openSocket();
    }

    openSocket() {
        this.websocket = new WebSocket("ws://" + this.server + "?n=" + this.windowTitle);

        this.websocket.onopen = (event) => { 
            this.socketInit();
            Playground.controlsOn();
        };
        this.websocket.onmessage = (event) => { console.log(event); };
        this.websocket.onclose = (event) => { 
            this.logSocketStatus(); 
            Playground.controlsOff();
        };
    }

    logSocketStatus() {
        switch (this.websocket.readyState) {
            case 0:
                console.log("connecting...");
                break;
            case 1:
                console.log("connected!");
                break;
            case 2:
                console.log("closing connection...");
                break;
            case 3:
                console.log("connection closed!");
        }
    }

    socketInit() {
        this.logSocketStatus();

        this.requestStateList();
    }

    // request the state list from mini
    requestStateList() {
        this.bleat(ChirpCan.msg.requestStateList);
    }

    static parseMessage(event) {
        return JSON.parse(event.data.slice(6, event.data.indexOf('}}') + 2));
    }

    // default recieve message callback
    recieveMessage(event) {
        const msg = ChirpCan.parseMessage(event);

        for (var i = 0; i < msg.payload.states.length; i++) {
            ChirpCan.states.push(new VeadoState(msg.payload.states[i]));
        }
    }

    /**
     * Sends a message to veadotube!
     * @param {Object} message JSON to stringify and send to veadotube.
     * @param {Function} callback optional, function/method to invoke when event occurs
     * @param {Number} senderIndex optional, index of the veadostate requesting something so it can not get lost
     * */
    bleat(message, callback = this.recieveMessage, senderIndex = 0) {
        this.websocket.onmessage = (event) => { callback(event, senderIndex) };
        this.websocket.send("nodes: "+JSON.stringify(message));
    }

    close() {
        console.log("closing connection... (might show an error after)");
        this.websocket.close();
    }
}