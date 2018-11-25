const request = require('request');
const cheerio = require('cheerio');
const http = require('http');
const iconv = require('iconv-lite');
const BufferHelper = require('bufferhelper');

function parseUrl(url) {
  const purl = url.indexOf('http://') === 0 ? url.substring(7) : url;
  if (purl.indexOf('/') >= 0) {
    const index = purl.indexOf('/');
    return {
      host: purl.substring(0, index),
      path: purl.substring(index),
    };
  }
  return { host: purl };
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
    const parsedUrl = parseUrl(url);
    const req = http.request({
      host: parsedUrl.host,
      path: parsedUrl.path,
      port: '80',
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
