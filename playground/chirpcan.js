/**
 * A single message to be sent by a ChirpCan.
 */
class Chirp {
    /**
     * Creates a Chirp - a message to be sent by a ChirpCan.
     * @param {String} message 
     */
    constructor(message, sender, callback) {
        this.message = message;
        this.sender = sender;
        this.callback = callback;
    }

    toString() {
        var eventType;
        if (this.message.event == "payload") {
            eventType = `${this.message.event}:${this.message.payload.event}`;
        }
        else {
            eventType = `${this.message.event}`;
        }
        return `
    Chirp
        from: ${this.sender}
        event type: ${eventType}
        `;
    }
}

/**
 * Talk to Veadotube... but in JS! Because, surely, people want to do that... Right?
 * (Name is a play on BleatCan.)
 */
class ChirpCan {

    /**
     * Holds messages we might want to send to Veadotube.
     */
    static messagePrompts = {
        /**
         * Request the list of nodes (connection targets) the Veado API is offering.
         */
        requestNodeList : {
            event: "list"
        },

        /**
         * Request the list of states from the 'mini' node.
         */
        requestStateList: {
            event: "payload",
            type: "stateEvents",
            id: "mini",
            payload: { event: "list" }
        }

    }

    /** If true, ChirpCan and related classes will log more info to console. */
    static verbose = true;

    states = [];

    /**
     * Track messages (Chirps) we want to send.
     * @type {Queue}
     */
    messageQueue = new Queue();
    /**
     * Whether we are already processing the messageQueue. We don't want to start reading it twice at once!
     */
    processingMessageQueue = false;
    /**
     * Whether we are waiting on a message currently. We don't want to re-assign a callback we're waiting on!!
     */
    pendingMessage = false;
    messageIntervalId = null;


    /** Gets config info from HTML and starts communication with the websocket server */
    constructor(server, windowTitle, index) {
        this.server = server;
        this.windowTitle = windowTitle;
        this.index = index;

        console.log("[ChirpCan] connecting...");

        //TODO: Try connecting to websocket
        this.openSocket();
    }

    // STATIC METHODS
    /** Parses a JSON message from Veadotube.*/
    static parseMessage(event) {
        return JSON.parse(event.data.slice(6, event.data.indexOf('}}') + 2));
    }

    /** The default callback when recieving a message. */
    static recieveMessage(event, sender) {
        const msg = ChirpCan.parseMessage(event);

        for (var i = 0; i < msg.payload.states.length; i++) {
            //console.log(msg.payload.states[i]);
            sender.states.push(new VeadoState(msg.payload.states[i], sender));
        }
    }

    // INSTANCE METHODS

    /** Opens a websocket to connect to Veadotube. */
    openSocket() {
        this.websocket = new WebSocket("ws://" + this.server + "?n=" + this.windowTitle);

        this.websocket.onopen = (event) => {
            // logs socket status to console
            this.logSocketStatus();

            // request state list - initializes state list
            this.requestStateList();
        };
        this.websocket.onmessage = (event) => { console.log(event); };
        this.websocket.onclose = (event) => { 
            // logs socket status to console
            this.logSocketStatus(); 

            // remove references to all states from the former connection
            delete this.states;

            Playground.controlsOff();
            Playground.clearStates();
        };
    }

    /** Logs the status of the websocket to console. */
    logSocketStatus() {
        switch (this.websocket.readyState) {
            case 0:
                console.log("[ChirpCan] connecting...");
                break;
            case 1:
                console.log("[ChirpCan] connected!");
                break;
            case 2:
                console.log("[ChirpCan] closing connection...");
                break;
            case 3:
                console.log("[ChirpCan] connection closed!");
        }
    }

    /** Requests the state list from mini. */
    requestStateList() {
        this.bleat(ChirpCan.messagePrompts.requestStateList, this);
    }

    /**
     * Sends a message to veadotube!
     * More accurately, wraps a message up in a little bow, adds it to this ChirpCan's
     * message queue, and politely asks ChirpCan to send it to Veadotube.
     * 
     * @param {Object} message JSON to stringify and send to veadotube.
     * @param {Number} sender a reference to the object requesting something, so the callback doesn't get lost.
     * @param {Function} callback optional, function/method to invoke when event occurs
     * */
    bleat(message, sender = this, callback = ChirpCan.recieveMessage) {
        // Add this message to the queue.
        this.messageQueue.offer(new Chirp(message, sender, callback));

        this.#processMessageQueue();
    }

    /**
     * Private method that actually sends messages to veado, in-order, without losing anything. god.
     * Ensures that it can only be running ONCE so it's safe to call it multiple times.
     */
    #processMessageQueue() {
        // quit if we're already running this, or if there's nothing to look at
        if (this.processingMessageQueue) {
            console.log("[ChirpCan] ignored request to process message queue - queue already being processed");

            return;
        }
        else if (this.messageQueue.isEmpty()) {
            clearInterval(this.messageIntervalId);
            this.messageIntervalId = null;

            console.log("[ChirpCan] stopped processing queue - queue is empty");
            return;
        }
        
        // indicate that we're processing so no other threads start
        else this.processingMessageQueue = true;

        // begin looping the message queue
        if (!this.pendingMessage) {
            if (verbose) console.log("[ChirpCan] recieved response, processing next message in queue...");

            clearInterval(this.messageIntervalId);
            this.messageIntervalId = null;
            
            this.pendingMessage = true;
            const chirp = this.messageQueue.poll();
            const callback = chirp.callback;
            const sender = chirp.sender;
            const message = chirp.message;

            if (verbose) console.log("[ChirpCan] processing"+chirp.toString());

        
            this.websocket.onmessage = (event) => {
                callback(event, sender); 
                this.pendingMessage = false; 
            };
            this.websocket.send("nodes: "+JSON.stringify(message));


            if (verbose) console.log("[ChirpCan] message sent. awaiting response");
        }

        // if the queue isn't empty & we don't already have an interval, set an interval to be recalled at
        if (this.messageQueue.size > 0 && this.messageIntervalId == null) {
            this.messageIntervalId = setInterval(() => {this.#processMessageQueue()}, 100);
        }
        

        this.processingMessageQueue = false;
    }

    /** Closes connection to Veadotube. */
    close() {
        console.log("[ChirpCan] closing connection... (might show an error after)");
        this.websocket.close();
    }

    /** 
     * Returns a string representation of this ChirpCan.
     * Identifies self as a ChirpCan & states what instance is being listened to. 
     */
    toString() {
        return `ChirpCan for server ${this.server}`;
    }
}