/**
 * Controls inspector functionality.
 */
class Inspector {
    e = {};
    currentBundle;

    /**
     * Creates an Inspector object based on the given HTML elements.
     * @param {String} titleTargetID The ID of the HTML element where the info title should be applied
     * @param {String} descTargetID (Optional) What to set this input to when reset
     */
    constructor(titleTargetID, descTargetID) {
        this.e.title = document.getElementById(titleTargetID);
        this.e.desc = document.getElementById(descTargetID);
        this.library = new Map();
    }

    /**
     * Adds the given bundle to this Inspector's library.
     * @param {InspectorInfoBundle} bundle
     */
    addToLibrary(bundle) {
        this.library.set(bundle.name, bundle)
    }

    /**
     * Private static method to generate a title to display.
     * @param {InspectorInfoBundle} bundle
     */
    static #generateTitle(bundle) {
        // 'bundle name: current page title'
        if (bundle.pages.length > 1) return bundle.name + ': ' + bundle.getCurrentPage()[0];

        else return bundle.getCurrentPage()[0];
    }

    /** 
     * Loads the given bundle's information into the HTML.
     * @param {String} bundleKey Name of the bundle to load
     */
    loadInfo(bundleKey) {
        this.currentBundle = this.library.get(bundleKey);
        this.e.title.innerHTML = Inspector.#generateTitle(this.currentBundle);
        this.e.desc.innerHTML = this.currentBundle.getCurrentPage()[1];
    }

    /** Turn to the next page. Used for buttons. */
    pageNext() {
        this.currentBundle.turnToPage(this.currentBundle.currentPage + 1);
    }

    /** Turn to the previous page. Used for buttons. */
    pagePrev() {
        this.currentBundle.turnToPage(this.currentBundle.currentPage - 1);
    }
}

/**
 * Holds information for an element that can be displayed in the inspector.
 */
class InspectorInfoBundle {
    /** Array of pages. Each page is a 2-element array. */
    pages = [];
    /** The index of the page this bundle is currently "open to." */
    currentPage = 0;

    /**
     * Creates a new empty InspectorInfoBundle.
     * @param {String} name A unique name for this bundle.
     */
    constructor(name) {
        /** The name of this bundle. Useful as a key when storing bundles in a Map. */
        this.name = name;
    }

    /**
     * Appends a page to the end of the info package.
     * 
     * @param {String} title Title of this info page, usually the name of the element in question
     * @param {String} desc Body text of this info page, usually a description of the element in question
     */
    pushPage(title, desc) {
        this.pages.push([title, desc]);
    }

    /**
     * Private method to validate indices
     */
    #isValidIndex(index) {
        return (index >= 0 && index < this.pages.length);
    }
    /** Special index which stands in for the last page's index.*/
    static #indexEnd =  -1;

    /**
     * Set the given page as the currentPage, and return it.
     * If the given index is invalid, does nothing.
     * @param {Number} index A valid page index from this bundle.
     */
    turnToPage(index) {
        // account for special index
        if (index == InspectorInfoBundle.#indexEnd) index = this.pages.length - 1;

        // validate index
        if (!this.#isValidIndex(index)) return;

        // set current page
        this.currentPage = index;

        // return current page data
        return getCurrentPage();
    }

    /**
     * Returns the current page.
     * @return {String[]} Current page contents.
     */
    getCurrentPage() {
        return this.pages[this.currentPage];
    }
}