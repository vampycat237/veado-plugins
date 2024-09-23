/**
 * Wrapper class for HTML input elements. Allows reading input value and resetting input value to a default value.
 */
class Input {
    /**
     * Creates an Input object for the given HTML input element.
     * @param {String} id The ID of the HTML input element
     * @param {String} defaultValue (Optional) What to set this input to when reset
     */
    constructor(id, defaultValue = null) {
        this.id = id;
        this.e = document.getElementById(id);
        this.defaultValue = defaultValue;
    }

    /**
     * Resets empty values to default, leaving non-empty values alone.
     * Returns true if it's safe to use getValue(), and false if it's
     * not safe to use getValue() as there was no default to reset to.
     * 
     * Should be run before using getValue().
     * 
     * @returns {boolean} False if this input was invalid and unable to be reset.
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
     * Returns true if this input's value is blank.
     * @returns {boolean}
     */
    isEmpty() {
        return this.e.value == '';
    }

    /**
     * Returns true if there is a default value for this input.
     * @returns {boolean}
     */
    hasDefaultValue() {
        return this.defaultValue !== null;
    }

    /**
     * Resets this Input's value (in the HTML) to its default value, or null if it doesn't have a default value.
     */
    resetToDefault() {
        this.e.value == this.defaultValue;
    }

    /**
     * Returns the user-input value from the HTML.
     */
    getValue() {
        return this.e.value;
    }
}