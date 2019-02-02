/* eslint-disable */

const request = require('request');

function getRealImageInfo(url, referer, success, error) {
  request({
    url,
    followRedirect: false,
    headers: {
      // 'User-Agent': fakeUserAgent,
      Referer: referer,
    },
  }, (err, response) => {
    if (err) {
      error(err);
    } else {
      success(response.headers.location);
    }
  });
}

getRealImageInfo(
  'https://www.cartoonmad.com/comic/comicpic.asp?file=/4085/002/001',
  'https://www.cartoonmad.com/comic/435201502015001.html',
  (url) => {
    console.log(url);
  },
  (err) => {
    console.log('error occured: ');
    console.error(err);
  },
);
