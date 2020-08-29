const path = require('path');

const webpack = require('webpack');
const Memoryfs = require('memory-fs');

const defaultFixture = path.resolve(__dirname, '../fixtures/messages.po');
const fixtureWithFuzzy = path.resolve(__dirname, '../fixtures/messagesWithFuzzy.po');
const fixtureWithMissingTranslation = path.resolve(__dirname, '../fixtures/messagesWithMissingTranslation.po');

const compile = (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: fixture,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.po$/,
          use: [
            'json-loader',
            {
              loader: path.resolve(__dirname, '../lib/index'),
              options,
            },
          ],
        },
      ],
    },
  });

  compiler.outputFileSystem = new Memoryfs();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(new Error(stats.toJson().errors));

      resolve(stats);
    });
  });
};

describe('react-intl-po-loader', () => {
  it('loads the po file', async () => {
    const stats = await compile(defaultFixture);

    const output = stats.toJson().modules[0].source;

    expect(output).toBe('module.exports = {"global.validate":"Valider","global.cancel":"Annuler"}');
  });

  it('loads the po file and does not include fuzzy entries if not specified', async () => {
    const stats = await compile(fixtureWithFuzzy);

    const output = stats.toJson().modules[0].source;

    expect(output).toBe('module.exports = {"global.cancel":"Annuler"}');
  });

  it('loads the po file and includes fuzzy entries if specified', async () => {
    const stats = await compile(
      fixtureWithFuzzy,
      {
        po2json: {
          fuzzy: true,
        },
      },
    );

    const output = stats.toJson().modules[0].source;

    expect(output).toBe('module.exports = {"global.validate":"Valider","global.cancel":"Annuler"}');
  });

  it('leaves empty messages if a translation is missing by default', async () => {
    const stats = await compile(fixtureWithMissingTranslation);

    const output = stats.toJson().modules[0].source;

    expect(output).toBe('module.exports = {"global.validate":"Valider","global.cancel":""}');
  });

  it('uses the default message if option is provided', async () => {
    const stats = await compile(
      fixtureWithMissingTranslation,
      {
        useDefaultMessage: true,
      },
    );

    const output = stats.toJson().modules[0].source;

    expect(output).toBe('module.exports = {"global.validate":"Valider","global.cancel":"Cancel"}');
  });
});
