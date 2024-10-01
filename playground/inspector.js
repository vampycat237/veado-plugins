/**
 * Controls inspector functionality.
 */
class Inspector {
    /** Holds element references.*/
    e = {};
    /** @type {InspectorInfoBundle} */
    currentBundle;

    /** If true, Inspector and related classes will log more.*/
    static verbose = false;

    /**
     * Creates an Inspector object based on the given HTML elements.
     * Expects to be contained in an element with class .inspector-container
     * @param {String} titleTargetID The ID of the HTML element where the info title should be applied
     * @param {String} descTargetID The ID of the HTML element where the info description should be applied
     */
    constructor(titleTargetID, descTargetID) {
        this.e.title = document.getElementById(titleTargetID);
        this.e.desc = document.getElementById(descTargetID);
        this.e.containers = $('.inspector-container');
        this.e.controls = $('.inspector-controls');

        /** @type {Map<String,InspectorInfoBundle>}*/
        this.library = new Map();
    }

    /**
     * Private static method to generate a title to display.
     * @param {InspectorInfoBundle} bundle
     */
    static #generateTitle(bundle) {
        // 'bundle name: current page title'
        if (bundle.size() > 1) return bundle.name + ': ' + bundle.getCurrentPage()[0];

        else return bundle.getCurrentPage()[0];
    }

    /**
     * Adds the given bundle to this Inspector's library.
     * @param {InspectorInfoBundle} bundle
     */
    addToLibrary(bundle) {
        this.library.set(bundle.name, bundle)
    }

    /** 
     * Loads the given bundle's information into the HTML.
     * @param {String} bundleKey Name of the bundle to load
     * @param {Boolean} silent Optional. If true, won't un-hide inspector after loading.
     */
    loadInfo(bundleKey, silent = false) {
        // set currentBundle
        this.currentBundle = this.library.get(bundleKey);

        // show or hide page buttons based on page count
        if (this.currentBundle.size)

        // update page display
        this.update();

        // show if not silent
        if (!silent) this.e.containers.show();
    }

    /** Turn to the next page. Used for buttons. */
    pageNext() {
        this.currentBundle.turnPageNext();
        this.update();
    }

    /** Turn to the previous page. Used for buttons. */
    pagePrev() {
        this.currentBundle.turnPagePrev();
        this.update();
    }

    /**
     * Loads the currently selected page into the HTML.
     */
    update() {
        this.e.title.innerHTML = Inspector.#generateTitle(this.currentBundle);
        this.e.desc.innerHTML = this.currentBundle.getCurrentPage()[1];

        // Show/hide inspector controls...
        // Hide if 1 or fewer pages
        if (this.currentBundle.size() <= 1) this.e.controls.hide();
        else this.e.controls.show();
    }
}

/**
 * Holds information for an element that can be displayed in the inspector.
 * Uses Inspector.verbose
 */
class InspectorInfoBundle {
    /** Special index which stands in for the last page's index.*/
    static #indexEnd = -1;

    /** 
    * Array of pages. Each page is a 2-element array. 
    * @type {String[]}
    */
    #pages;

    /**
     * Creates a new empty InspectorInfoBundle.
     * @param {String} name A unique name for this bundle.
     */
    constructor(name) {
        /** The name of this bundle. Useful as a key when storing bundles in a Map. */
        this.name = name;

        /** The index of the page this bundle is currently "open to." */
        this.currentPage = 0;

        this.#pages = [];
    }

    /**
     * Appends a page to the end of the info package.
     * 
     * @param {String} title Title of this info page, usually the name of the element in question
     * @param {String} desc Body text of this info page, usually a description of the element in question
     */
    pushPage(title, desc) {
        this.#pages.push([title, desc]);
    }

    /**
     * Private method to validate indices
     */
    #isValidIndex(index) {
        return (index >= 0 && index < this.size());
    }

    /**
     * Set the given page as the currentPage, and return it.
     * If the given index is invalid, does nothing.
     * @param {Number} index A valid page index from this bundle.
     */
    turnToPage(index) {
        // account for special index
        if (index == InspectorInfoBundle.#indexEnd) index = this.size() - 1;

        // validate index
        if (!this.#isValidIndex(index)) {
            console.warn("[inspector] invalid index " + index + " passed to bundle " + this.toString());
            return;
        }

        // set current page
        this.currentPage = index;
        if (Inspector.verbose) console.log("[inspector] set currentPage to " + this.currentPage);

        // return current page data
        return this.getCurrentPage();
    }

    /**
     * Returns the current page.
     * @return {String[]} Current page contents.
     */
    getCurrentPage() {
        return this.#pages[this.currentPage];
    }

    /** 
     * Turns the page "left" (to the previous page) and returns the new page.
     * @return {String[]} New page contents.
     */
    turnPagePrev() {
        var index;

        // if we are at first page, set index to special "last page" index. this lets us loop
        if (this.currentPage == 0) index = InspectorInfoBundle.#indexEnd;

        // otherwise, set index to currentPage - 1
        else index = this.currentPage - 1;

        return this.turnToPage(index);
    }

    /** 
     * Turns the page "right" (to the next page) and returns the new page.
     * @return {String[]} New page contents.
     */
    turnPageNext() {
        var index;

        // if we are at last page, set index to first page
        if (this.currentPage >= this.size() - 1) index = 0;

        // otherwise, set index to currentPage + 1
        else index = this.currentPage + 1;

        return this.turnToPage(index);
    }

    /** Returns a string representation of this bundle. */
    toString() {
        return `Bundle '${this.name}' on page ${this.currentPage}/${this.size()}`;
    }

    /** Returns the number of pages in this bundle.*/
    size() {
        return this.#pages.length;
    }
}