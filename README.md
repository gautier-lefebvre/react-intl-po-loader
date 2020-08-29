# react-intl-po-loader

Webpack loader for PO files generated with react-intl-po.

Classic workflow for using this loader is:

1. Extract the messages using `babel-plugin-react-intl`.

2. Generate a POT file with react-intl-po and set the react-intl id as context in the POT with:
- `.tmp/i18n/messages.json` the file generated using `babel-plugin-react-intl`.
- `.tmp/i18n/messages.pot` the output file.

```sh
react-intl-po json2pot .tmp/i18n/messages.json -o .tmp/i18n/messages.pot -c id
```

Don't forget the `-c id` option to set the context in the POT file, it will be used by the
loader to create the `id => msg` map.

3. Use the POT file tu create PO files for each language.
4. Translate the entries.
5. Import PO files directly in your code using this loader.

## Installing / Getting started

1. Install `react-intl-po-loader`.

```shell
yarn add --dev react-intl-po-loader
```

2. Add a rule for po files in webpack.

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.po$/i,
        use: [
          {
            // react-intl-po-loader returns a JS object,
            // use json-loader to return a module.
            loader: 'json-loader',
          },
          {
            loader: 'react-intl-po-loader',
            options: {
              // po2json.parse options.
              // See https://github.com/mikeedwards/po2json#methods.
              po2json: {
                fuzzy: true,
              },
            },
          },
        ],
      },
    ],
  },
};
```

3. Import po files in your code.

```shell
# messages.po

msgctxt "global.validate"
msgid "Validate"
msgstr "Valider"

msgctxt "global.cancel"
msgid "Cancel"
msgstr "Annuler"
```

```js
// Your code.
import messages from './messages.po';

// messages =>
// {
//   "global.validate": "Valider",
//   "global.cancel": "Annuler",
// }
```

## Options

- **[po2json]** *(Object)* - `po2json#parse()` options (see [their documentation](https://github.com/mikeedwards/po2json#methods)).

- **[useDefaultMessage]** *(boolean)* - If `true`, when a translation is missing, use the untranslated message. This can be useful when using `react-intl` without parser.

## Tests

```shell
yarn test
```
