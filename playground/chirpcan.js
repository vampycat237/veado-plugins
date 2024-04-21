/**
 * Stores the info of a single message prompt from this end.
 */
class Chirp {
    constructor(message, sender, callback) {
        this.message = message;
        this.sender = sender;
        this.callback = callback;
    }
}

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

    states = []

    /**
     * Track bleats we want to send.
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


    // Gets config info from HTML and starts communication with the websocket server
    constructor(server, windowTitle, index) {
        this.server = server;
        this.windowTitle = windowTitle;
        this.index = index;

        console.log("connecting...");

        //TODO: Try connecting to websocket
        this.openSocket();
    }

    openSocket() {
        this.websocket = new WebSocket("ws://" + this.server + "?n=" + this.windowTitle);

        this.websocket.onopen = (event) => {
            // logs socket status to console
            this.logSocketStatus();

            // request state list - initializes state list
            this.requestStateList();

            // update controls display
            Playground.controlsOn();
        };
        this.websocket.onmessage = (event) => { console.log(event); };
        this.websocket.onclose = (event) => { 
            // logs socket status to console
            this.logSocketStatus(); 

            // remove references to all states from the former connection
            Playground.containers.states.innerHTML = ""; // TODO: We'll want to move states into here probably
            delete this.states;

            // update controls display
            // TODO: might need to be changed for multi-connection support
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

    // request the state list from mini
    requestStateList() {
        this.bleat(ChirpCan.msg.requestStateList, this);
    }

    static parseMessage(event) {
        return JSON.parse(event.data.slice(6, event.data.indexOf('}}') + 2));
    }

    // default recieve message callback
    static recieveMessage(event, sender) {
        const msg = ChirpCan.parseMessage(event);

        for (var i = 0; i < msg.payload.states.length; i++) {
            console.log(msg.payload.states[i]);
            sender.states.push(new VeadoState(msg.payload.states[i], sender));
        }
    }

    /**
     * Sends a message to veadotube!
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
     * Private helper method that actually sends messages to veado, in-order. god.
     * 
     * Ensures that it can only be running ONCE so it's safe to call it multiple times.
     */
    #processMessageQueue() {
        console.log("#processMessageQueue: "+this.processingMessageQueue);
        // quit if we're already running this, or if there's nothing to look at
        if (this.messageQueue.size <= 0 || this.processingMessageQueue) return;
        // otherwise, indicate that we're processing so no other threads start.
        else this.processingMessageQueue = true;

        console.log("#processMessageQueue: started processing message queue");

        // begin looping the message queue
        if (!this.pendingMessage) {
            clearInterval(this.messageIntervalId);
            this.messageIntervalId = null;
            
            this.pendingMessage = true;
            const chirp = this.messageQueue.poll();
            const callback = chirp.callback;
            const sender = chirp.sender;
            const message = chirp.message;

            console.log(chirp);

        
            this.websocket.onmessage = (event) => {
                callback(event, sender); 
                this.pendingMessage = false; 
            };
            this.websocket.send("nodes: "+JSON.stringify(message));
        }
        if (this.messageQueue.size > 0 && this.messageIntervalId == null) {
            this.messageIntervalId = setInterval(() => {this.#processMessageQueue()}, 100);
        }
        

        this.processingMessageQueue = false;

        console.log("#processMessageQueue: paused processing message queue");
    }

    close() {
        console.log("closing connection... (might show an error after)");
        this.websocket.close();
    }
}