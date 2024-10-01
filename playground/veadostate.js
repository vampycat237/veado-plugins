/**
 * Reveals state information, intended to facilitate state switching from browser
 * Construct by simply passing it id and name from JSON
 */
class VeadoState {
    /**
     * Creates a VeadoState object based on a payload.
     * @param {JSON} payload A state payload from Veadotube.
     * @param {ChirpCan} chirpCan The ChirpCan in charge of this VeadoState.
     */
    constructor(payload, chirpCan) {
        // remember parent
        this.chirpCan = chirpCan;

        // grab stuff from the parsed json
        this.id = payload.id;
        this.name = payload.name;

        this.msg = {
            requestThumbnail : {
                event: "payload",
                type: "stateEvents",
                id: "mini",
                payload: {
                    event: "thumb", state: this.id
                }
            }
        }

        // request the thumbnail from veadotube
        this.requestThumbnail();
    }

    /**
     * Identifies type, states name & id.
     */
    toString() {
        return `VeadoState ${this.name} (id ${this.id})`;
    }

    /** Requests the state thumbnail from veadotube via its ChirpCan. */
    requestThumbnail() {
        this.chirpCan.bleat(this.msg.requestThumbnail, this, VeadoState.thumbnailCallback);
    }

    /**
     * Set the src element of this object to the thumbnail.
     * 
     * TODO: Expand to work on other filetypes than just PNG
     * @param {*} payload
     */
    setThumbnail(payload) {
        //console.log(payload);
        const format = "png";
        this.src = `data:image/${format};base64,${payload.png}`;
        
        this.actualizeHTML();
    }

    /**
     * Javascript lost track of "this", so we've got a weird little way to look ourself up instead.
     * @param {Event} event 
     * @param {VeadoState} sender
     */
    static thumbnailCallback(event, sender) {
        const msg = ChirpCan.parseMessage(event)
        sender.setThumbnail(msg.payload);
    }

    /**
     * Returns a string HTML representation of this object
     */
    toHTML() {
        return `
        <div id="${this.id}" class="gallery-item">
            <img src="${this.src}" />
            <span>${this.name}</span>
        </div>
        `;
    }

    /**
     * Creates an HTML element representing this object.
     * TODO: Make ChirpCan and/or Playground handle this.
     */
    actualizeHTML() {
        Playground.insertState(this); 
    }
}