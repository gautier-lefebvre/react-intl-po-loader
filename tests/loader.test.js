const path = require('path');

const webpack = require('webpack');
const memoryfs = require('memory-fs');

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

  compiler.outputFileSystem = new memoryfs();

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
    const stats = await compile(path.resolve(__dirname, '../fixtures/messages.po'));

    const output = stats.toJson().modules[0].source;

    expect(output).toBe('module.exports = {\"global.validate\":\"Valider\",\"global.cancel\":\"Annuler\"}');
  });

  it('loads the po file and does not include fuzzy entries if not specified', async () => {
    const stats = await compile(path.resolve(__dirname, '../fixtures/messagesWithFuzzy.po'));

    const output = stats.toJson().modules[0].source;

    expect(output).toBe('module.exports = {\"global.cancel\":\"Annuler\"}');
  });

  it('loads the po file and includes fuzzy entries if specified', async () => {
    const stats = await compile(
      path.resolve(__dirname, '../fixtures/messagesWithFuzzy.po'),
      {
        po2json: {
          fuzzy: true,
        },
      },
    );

    const output = stats.toJson().modules[0].source;

    expect(output).toBe('module.exports = {\"global.validate\":\"Valider\",\"global.cancel\":\"Annuler\"}');
  });
});
