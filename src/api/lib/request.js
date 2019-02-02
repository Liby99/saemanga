const request = require('request');
const cheerio = require('cheerio');
const https = require('https');
const http = require('http');
const iconv = require('iconv-lite');
const BufferHelper = require('bufferhelper');

const httpPrefix = 'http://';
const httpsPrefix = 'https://';

const fakeUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.46 Safari/537.36';

function parseHttpUrl(url) {
  const index = url.indexOf('/');
  if (index >= 0) {
    return {
      generator: http,
      port: 80,
      host: url.substring(0, index),
      path: url.substring(index),
    };
  }
  return {
    generator: http,
    port: 80,
    host: url,
  };
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
  }
  return {
    generator: https,
    port: 443,
    host: url,
  };
}

function parseUrl(url) {
  if (url.indexOf(httpsPrefix) === 0) {
    return parseHttpsUrl(url.substring(httpsPrefix.length));
  }
  if (url.indexOf(httpPrefix) === 0) {
    return parseHttpUrl(url.substring(httpPrefix.length));
  }
  return parseHttpUrl(url);
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
  getWithReferer(url, referer, success, error) {
    request({
      url,
      followRedirect: false,
      headers: {
        'User-Agent': fakeUserAgent,
        Referer: referer,
      },
    }, (err, response, body) => {
      if (err) {
        error(err);
      } else {
        success(response, body);
      }
    });
  },
  post(url, data, success, error) {
    const {
      generator, port, host, path,
    } = parseUrl(url);
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
