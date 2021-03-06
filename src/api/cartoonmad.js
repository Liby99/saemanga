const request = require('request');
const Debug = require('keeling-js/lib/debug');
const Iconv = require('iconv-lite');
const Request = require('./lib/request');
const Chinese = require('./lib/chinese');

// Url lists
const BASE_URL = 'https://www.cartoonmad.com/';
const SEARCH_URL = `${BASE_URL}search.html`;

// Regex lists
const COMIC_URL_REG = /^comic\/(\d+)\.html$/;
const COMIC_GENRE_REG = /^\/(comic\d\d).html$/;
const NUM_REG = /\d+/;
const COMIC_IMG_ASP_REG = /^comicpic\.asp\?file=\/(\d+)\/\d+\/\d+/;
const COMIC_IMG_SRC_REG_NEW = /^\/home1\/([\d\w]+)\/(\d+)\/\d+\/\d+\.jpg$/;
const COMIC_IMG_SRC_REG = /^\/cartoonimg\/([\d\w]+)\/(\d+)\/\d+\/\d+\.jpg$/;
const COMIC_IMG_SRC_REG_OLD = /^https?:\/\/(web\d?)\.cartoonmad\.com\/([\w|\d]+)\//;

function getMangaUrl(id) {
  return `${BASE_URL}comic/${id}.html`;
}

function getEpisodeList($rs) {
  const arr = [];
  for (let i = 1; i < $rs.length; i += 1) {
    const $ds = $rs.eq(i).children('td');
    for (let j = 1; j < $ds.length; j += 1) {
      const $e = $ds.eq(j);
      const $a = $e.children('a').eq(0);
      const $font = $e.children('font').eq(0);
      const _epi = $a.text().trim();
      const _mepi = _epi.match(NUM_REG);
      const _page = $font.text().trim();
      const _mpage = _page.match(NUM_REG);
      if (_mepi && _mpage) {
        arr.push({
          index: parseInt(_mepi[0], 10),
          pages: parseInt(_mpage[0], 10),
        });
      } else {
        throw new Error('Error matching episode list');
      }
    }
  }
  return arr;
}

function extractHotMangaId($) {
  // First get $r, all the hot mangas
  const $rs = $('body').children('table').children('tbody')
    .children('tr')
    .eq(0)
    .children('td')
    .eq(1)
    .children('table')
    .children('tbody')
    .children('tr')
    .eq(3)
    .children('td')
    .children('table')
    .children('tbody')
    .children('tr')
    .eq(1)
    .children('td')
    .eq(1)
    .children('table')
    .children('tbody')
    .children('tr');
  const $r = $rs.eq(2).append($rs.eq(4).children()).children();
  return $r.map((i, e) => $(e).children('a').attr('href')).get().reduce((ids, url) => {
    const m = url.match(COMIC_URL_REG);
    return m ? ids.concat(m[1]) : ids;
  }, []);
}

function getHotMangaWithUrl(url, callback, error) {
  Request.get(url, (res, $) => {
    let extracted;
    try {
      extracted = extractHotMangaId($);
    } catch (err) {
      error(err);
      return;
    }
    callback(extracted);
  }, () => {
    error(new Error('Internet connection error'));
  });
}

function toByteString(str) {
  const buf = Iconv.encode(str, 'Big5');
  const hex = buf.toString('hex');
  let ret = '';
  for (let i = 0; i < hex.length; i += 2) {
    ret += `%${hex[i].toUpperCase()}${hex[i + 1].toUpperCase()}`;
  }
  return ret;
}

function getSearchQuery(str) {
  return `keyword=${toByteString(str)}&searchtype=all`;
}

const imgSrcParsers = [
  (location, success, error) => {
    const res = location.match(/(web\d*)\.cartoonmad.com\/(home\d+)\/(\d+)\/\d+\/\d+\.jpg/);
    if (res) {
      const [, dmkIdWeb, dmkIdHome] = res;
      success({
        dmk_id_web: dmkIdWeb,
        dmk_id_home: dmkIdHome,
        id_ver: 10,
      });
    } else {
      error(new Error(`Cannot parse ${location} using version 10 parser`));
    }
  },
  (location, success, error) => {
    const res = location.match(/(home\d+)\/(\d+)\/\d+\/\d+\.jpg/);
    if (res) {
      const [, dmkIdHome] = res;
      success({ dmk_id_home: dmkIdHome, id_ver: 9 });
    } else {
      error(new Error(`Cannot parse ${location} using version 9 parser`));
    }
  },
  (location, success, error) => {
    const res = location.match(/^\/([\w\d]+)\/(\d+)\/\d+\/\d+\.jpg$/);
    if (res) {
      const [, dmkIdHome] = res;
      success({ dmk_id_home: dmkIdHome, id_ver: 8 });
    } else {
      error(new Error(`Cannot parse ${location} using version 8 parser`));
    }
  },
  (location, success, error) => {
    const regRes = location.match(COMIC_IMG_SRC_REG_NEW);
    if (regRes) {
      const [, dmkIdGen] = regRes;
      success({ dmk_id_gen: dmkIdGen, id_ver: 7 });
    } else {
      error(new Error(`Cannot parse ${location} using version 7 parser`));
    }
  },
  (location, success, error) => {
    const regRes = location.match(COMIC_IMG_SRC_REG);
    if (regRes) {
      const [, dmkIdGen] = regRes;
      success({ dmk_id_gen: dmkIdGen, id_ver: 6 });
    } else {
      error(new Error(`Cannot parse ${location} using version 6 parser`));
    }
  },
  (location, success, error) => {
    const regRes = location.match(COMIC_IMG_SRC_REG_OLD);
    if (regRes) {
      const [, dmkIdWeb, dmkIdGen] = regRes;
      success({ dmk_id_web: dmkIdWeb, dmk_id_gen: dmkIdGen, id_ver: 5 });
    } else {
      error(new Error(`Cannot parse ${location} using version 5 parser`));
    }
  },
];

function getRealImageInfo(aspUrl, baseUrl, success, error) {
  request({
    url: aspUrl,
    followRedirect: false,
    headers: { Referer: baseUrl },
  }, (err, response) => {
    if (err) {
      error(err);
    } else {
      const { headers: { location }, rawHeaders } = response;
      if (location) {
        (function process([attempt, ...rest]) {
          if (attempt) {
            attempt(location, (result) => {
              success(result);
            }, () => {
              process(rest);
            });
          } else {
            error(new Error(`Cannot parse ${location}`));
          }
        }(imgSrcParsers));
      } else {
        error(new Error(`No location presented in redirect header ${rawHeaders}`));
      }
    }
  });
}

module.exports = {

  /**
   * Get all the hot manga (latest update) id array
   * @param  {Function} callback with array of manga id
   * @throw error when internet connection error
   */
  getHotManga(callback, error) {
    getHotMangaWithUrl(BASE_URL, callback, error);
  },

  /**
   * Get the hot manga of a certain genre (latest update) id array
   * @param  {Function} callback with array of manga id
   * @throw error when internet connection error
   */
  getHotMangaOfGenre(genreDir, callback, error) {
    getHotMangaWithUrl(`${BASE_URL + genreDir}.html`, callback, error);
  },

  /**
   * Get manga info using dmk_id.
   * @param  {string|integer}   dmkId    id of dmk
   * @param  {Function} callback callback
   * @return {object}            manga info
   */
  getMangaInfo(dmkId, callback, error) {
    Request.get(getMangaUrl(dmkId), (res, $) => {
      if (res.connection._httpMessage.path === '/') {
        error(`Manga ${dmkId} not found`);
        return;
      }

      // Precache info
      const manga = { dmk_id: dmkId, info: {} };

      try {
        // Traverse
        const $ps = $('body').children('table').children('tbody')
          .children('tr')
          .eq(0)
          .children('td')
          .eq(1)
          .children('table')
          .children('tbody')
          .children('tr');

        // Get the header
        const $h = $ps.eq(2).children('td').eq(1).children('a')
          .last();
        manga.info.title = $h.text();

        // Go to the main section
        const $m = $ps.eq(3).children('td').children('table')
          .children('tbody')
          .children('tr')
          .eq(1)
          .children('td')
          .eq(1)
          .children('table');

        // Get author
        const $t1 = $m.eq(0).children('tbody').children('tr');
        const _g = $t1.eq(2).children('td').children('a').eq(0)
          .attr('href');
        const _gm = _g && _g.match(COMIC_GENRE_REG);
        manga.info.genre_dir = _gm ? _gm[1] : '';
        const _as = $t1.eq(4).children('td').text().trim()
          .split(' ');
        manga.info.author = _as[_as.length - 1];
        const $tags = $t1.eq(12).children('td').children('a');
        const _ta = Array.apply(1, { length: $tags.length });
        manga.info.tags = _ta.map((n, i) => $tags.eq(i).text()).filter(t => t !== '');
        const _src = $t1.eq(6).find('img').last().attr('src');
        manga.info.ended = _src && (_src.indexOf('9') > 0);

        // Get Description
        const $t2 = $m.eq(1).find('tbody tr td fieldset table tbody tr td');
        manga.info.description = $t2.text().trim();

        // Get books and episodes
        const $t3 = $m.eq(2).find('tbody tr td fieldset table');
        if ($t3.length === 1) {
          manga.episodes = getEpisodeList($t3.eq(0).find('tbody tr'));
        } else {
          manga.books = getEpisodeList($t3.eq(0).find('tbody tr'));
          manga.episodes = getEpisodeList($t3.eq(1).find('tbody tr'));
        }

        // Get manga ids
        const epiHref = $t3.eq(0).find('tbody tr').eq(1).children('td')
          .eq(1)
          .children('a')
          .attr('href')
          .substring(1);
        const epiUrl = BASE_URL + epiHref;
        Request.get(epiUrl, (res2, $2) => {
          const $tr = $2('body > table > tbody > tr').eq(4);
          const $a = $tr.children('td')
            .children('table')
            .children('tbody')
            .children('tr')
            .eq(0)
            .children('td')
            .eq(0)
            .children('a');
          const $img = $a.children('img');
          const src = $img.attr('src');
          if (src) {
            if (src.match(COMIC_IMG_ASP_REG)) {
              const aspSrc = `${BASE_URL}comic/${src}`;
              // At this point (Samples)
              // - src: comicpic.asp?file=/4085/002/001
              // - epiUrl: https://www.cartoonmad.com/comic/435201502015001.html
              // - aspSrc: https://www.cartoonmad.com/comic/comicpic.asp?file=/4085/002/001
              getRealImageInfo(aspSrc, epiUrl, (result) => {
                callback({ ...manga, ...result });
              }, (err) => {
                error(err);
              });
            } else {
              Debug.error(`Cannot parse ASP src from ${src}`);
              error(new Error(`Cannot parse ASP src from ${src}`));
            }
          } else {
            Debug.error(`Cannot get manga ${dmkId} img src info`);
            error(new Error(`Cannot get image src for manga ${dmkId}`));
          }
        }, error);
      } catch (err) {
        Debug.error(`Error getting manga ${dmkId} info`);
        error(err);
      }
    }, error);
  },

  search(str, callback, error) {
    // First process the string and get the query arguments
    if (!str || !str.trim().length) {
      error(new Error('Search text cannot be empty'));
      return;
    }
    const query = getSearchQuery(Chinese.traditionalize(str.trim()));

    // Then go to the search request
    Request.post(SEARCH_URL, query, (res, $) => {
      // First go to the table
      const $rs = $('body').children('table').children('tbody')
        .children('tr')
        .eq(0)
        .children('td')
        .eq(1)
        .children('table')
        .children('tbody')
        .children('tr')
        .eq(3)
        .children('td')
        .children('table')
        .children('tbody')
        .children('tr')
        .eq(1)
        .children('td')
        .eq(1)
        .children('table')
        .children('tbody')
        .children('tr');
      const $r = $rs.eq(2);

      // Check if
      if ($r.text().indexOf('抱歉，資料庫找不到該漫畫。') >= 0) {
        callback([]);
      } else {
        const ms = $rs.filter(i => i > 0 && i % 2 === 0).map((i, e) => {
          const $a = $(e).children().eq(0).children('a');
          return { href: $a.attr('href'), title: $a.text() };
        }).get().filter(({ href, title }) => !!href && !!title && href.trim() !== '' && title.trim() !== '')
          .reduce((arr, { href, title }) => {
            const m = href.match(COMIC_URL_REG);
            if (m) {
              return arr.concat({
                dmk_id: m[1],
                title,
              });
            }
            return arr;
          }, []);
        callback(ms);
      }
    }, error);
  },
};
