const utils = require('loader-utils');
const po2json = require('po2json');

/**
 * Load the source and return a JS object for the next loader.
 *
 * @param {string} source - The PO file content.
 * @returns {object} The translations mapped as { id: "translation" }.
 */
module.exports = function reactIntlPoLoader(source) {
  // Set the loader as cacheable (no external dependencies).
  this.cacheable();

  // Get the loader options.
  const options = utils.getOptions(this) || {};

  // Parse the PO file with user defined option.
  const parsed = po2json.parse(source, options.po2json);

  return Object.keys(parsed).reduce(
    (result, key) => {
      // The msgCtxt is the id defined in defineMessages.
      // po2json concatenates it to the defaultMessage as the key of its messages.
      // msgCtxt\u0004msgId
      // https://github.com/mikeedwards/po2json/issues/67#issuecomment-424027289
      const [msgCtxt] = key.split('\u0004');

      // The value is a array with 2 elements, the first one always being null
      // since react-intl-po does not specify msgid_plural.
      result[msgCtxt] = parsed[key][1];
      return result;
    },
    {},
  );
};
