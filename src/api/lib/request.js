const request = require('request');
const cheerio = require('cheerio');
const https = require('https');
const http = require('http');
const iconv = require('iconv-lite');
const BufferHelper = require('bufferhelper');

const httpPrefix = 'http://';
const httpsPrefix = 'https://';

function parseHttpUrl(url) {
  const index = url.indexOf('/');
  if (index >= 0) {
    return {
      generator: http,
      port: 80,
      host: url.substring(0, index),
      path: url.substring(index),
    };
  } else {
    return {
      generator: http,
      port: 80,
      host: url
    };
  }
}

function parseHttpsUrl(url) {
  const index = url.indexOf('/');
  if (index >= 0) {
    return {
      generator: https,
      port: 443,
      host: url.substring(0, index),
      path: url.substring(index),
    };
  } else {
    return {
      generator: https,
      port: 443,
      host: url
    };
  }
}

function parseUrl(url) {
  if (url.indexOf(httpsPrefix) === 0) {
    return parseHttpsUrl(url.substring(httpsPrefix.length));
  } else {
    if (url.indexOf(httpPrefix) === 0) {
      return parseHttpUrl(url.substring(httpPrefix.length));
    } else {
      return parseHttpUrl(url);
    }
  }
}

module.exports = {
  get(url, success, error) {
    request({
      url,
      encoding: null,
    }, (err, response, body) => {
      if (err) {
        error(err);
      } else {
        const cbody = iconv.decode(body, 'Big5');
        success(response, cheerio.load(cbody));
      }
    });
  },
  post(url, data, success, error) {
    const { generator, port, host, path } = parseUrl(url);
    const req = generator.request({
      host,
      path,
      port,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      const bufferhelper = new BufferHelper();
      res.on('data', (chunk) => {
        bufferhelper.concat(chunk);
      });
      res.on('end', () => {
        const cbody = iconv.decode(bufferhelper.toBuffer(), 'Big5');
        success(res, cheerio.load(cbody));
      });
    });
    req.on('error', (err) => {
      error(err);
    });
    req.write(data);
    req.end();
  },
};
