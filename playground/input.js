class Input {
    /**
     * 
     * @param {String} id 
     * @param {String} defaultValue
     */
    constructor(id, defaultValue = null) {
        this.id = id;
        this.e = document.getElementById(id);
        this.defaultValue = defaultValue;
    }

    /**
     * Determines if this input is valid.
     * @returns {boolean} True if this input was already valid, or was blank and reset to default. False if this input was invalid and unable to be reset.
     */
    validate() {
        // If the input is empty but we don't have a default, validation fails.
        if (this.isEmpty() && !this.hasDefaultValue()) return false;

        // If the input is not empty, validation succeeds.
        if (!this.isEmpty()) return true;

        // If the input is empty, but can be replaced with the default: Do that, then we consider it a success.
        this.resetToDefault();
        return true;
    }

    /**
     * Determines if this input's value is blank.
     * @returns {boolean} True if this input's value is blank.
     */
    isEmpty() {
        return this.e.value == '';
    }

    /**
     * Determines if this 
     */
    hasDefaultValue() {
        return this.defaultValue !== null;
    }

    resetToDefault() {
        this.e.value == this.defaultValue;
    }

    getValue() {
        return this.e.value;
    }
}