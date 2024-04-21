/**
 * Linked list style node
 */
class QueueItem {
    /**
     * 
     * @param {*} data 
     * @param {QueueItem} next opt
     */
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

/**
 * Fuck it writing my own data structure implementations again.
 * Single-direction queue. First in First out as queues should be. Loosely based on Java Queue interface.
 */
class Queue {
    /**
     * The first guy in line, as it were. Retrieved by peek and such.
     */
    head;

    /**
     * The last guy in line. Used when adding to queue
     */
    tail;

    /**
     * Length of the current queue.
     */
    size;

    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    /**
     * Adds the data item to the tail of the queue.
     * @param {*} data 
     */
    offer(data) {
        if (this.size == 0) {
            this.head = new QueueItem(data);
            this.tail = this.head;
        }
        else {
            this.tail.next = new QueueItem(data);
        }
        this.size++;
    }

    /**
     * Removes and returns the head of this queue.
     * @returns {QueueItem.data|null}
     */
    poll() {
        if (this.size == 0) return null;
        else {
            const oldHead = this.head;
            this.head = this.head.next;

            this.size--;
            return oldHead.data;
        }
    }
}