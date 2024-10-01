/**
 * Single-direction, linked list style node.
 */
class QueueItem {
    /**
     * Wraps the given data in a QueueItem.
     * @param {*} data 
     * @param {QueueItem} next opt
     */
    constructor(data) {
        /** Data this QueueItem is holding.*/
        this.data = data;
        /**
         * Reference to the next QueueItem.
         * @type {QueueItem}
         */
        this.next = null;
    }

    toString() {
        return this.data.toString();
    }
}

/**
 * Single-direction queue. First in, first out, as queues should be. Loosely based on the Java Queue interface.
 * Didn't like JS's data structure options so I made my own. Made for ChirpCan but probably useful for other things too!
 */
class Queue {
    /**
     * The first guy in line, as it were. Retrieved by poll.
     * @type {QueueItem}
     */
    #head;

    /**
     * The last guy in line. Used when adding to queue.
     * @type {QueueItem}
     */
    #tail;

    /** Length of the current queue. */
    size;

    /** Creates a new empty Queue. */
    constructor() {
        this.#head = null;
        this.#tail = null;
        this.size = 0;
    }

    /**
     * Adds the data item to the tail of the queue.
     * @param {*} data 
     */
    offer(data) {
        //console.log("Queue offered: "+data.toString());
        const newItem = new QueueItem(data);

        if (this.isEmpty()) { // size == 0: newItem should be the head now
            this.head = newItem;
            this.#tail = this.#head;
        }
        else if (this.size == 1) { // size == 1: newItem should be the head's .next
            this.#head.next = newItem;
            this.#tail = this.#head.next;
        }
        else {
            this.#tail.next = newItem;
            this.#tail = this.#tail.next;
        }

        this.size++;
        //console.log("Queue's current head: "+this.head.toString());
    }

    /**
     * Removes and returns the head of this queue.
     * @returns {QueueItem.data|null}
     */
    poll() {
        //console.log("Queue's previous head: "+this.head.toString());
        if (this.isEmpty()) return null;
        else {
            const oldHead = this.#head;
            this.head = this.#head.next;

            this.size--;

            //if (!this.isEmpty()) console.log("Queue's new head: "+this.head.toString());
            return oldHead.data;
        }
    }

    /** True if the queue is empty. */
    isEmpty() {
        if (this.size == 0) return true;
        else if (this.#head == null) {
            console.warn("Queue: Size is not 0, but head is null. This might cause issues. Queue object logged below");
            console.log(this);
            return false;
        }
        else {
            return false;
        }
    }
}