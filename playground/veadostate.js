/**
 * Reveals state information, intended to facilitate state switching from browser
 * Construct by simply passing it id and name from JSON
 */
class VeadoState {

    static maxIndex = 0;

    constructor(parsedJson) {
        // record index information first and foremost
        this.index = VeadoState.maxIndex;
        VeadoState.maxIndex++;

        // grab stuff from the parsed json
        this.id = parsedJson.id;
        this.name = parsedJson.name;

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

    requestThumbnail() {
        chirpCan.bleat(this.msg.requestThumbnail, VeadoState.thumbnailCallback, this.index);
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
     * @param {*} senderIndex 
     */
    static thumbnailCallback(event, senderIndex) {
        const msg = ChirpCan.parseMessage(event)
        ChirpCan.states[senderIndex].setThumbnail(msg.payload);
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
        `
    }

    /**
     * Creates an HTML element representing this object.
     */
    actualizeHTML() {
        Playground.containers.states.insertAdjacentHTML("beforeend", this.toHTML());
    }
}