/**
 * Cartoonmad Scrapper
 * @author Liby99
 * @date 2017/11/28
 */

const Debug = require('keeling-js/lib/debug');
const Iconv = require('iconv-lite');
const Request = require('./lib/request');
const Chinese = require('./lib/chinese');

// Url lists
const BASE_URL = 'http://cartoonmad.com/';
const SEARCH_URL = `${BASE_URL}search.html`;

// Regex lists
const COMIC_URL_REG = /^comic\/(\d+)\.html$/;
const COMIC_GENRE_REG = /^\/(comic\d\d).html$/;
const NUM_REG = /\d+/;
const COMIC_IMG_SRC_REG = /^http:\/\/(web\d?)\.cartoonmad\.com\/([\w|\d]+)\//;

function getMangaUrl(id) {
  return `${BASE_URL}comic/${id}.html`;
}

function getEpisodeList($rs) {
  const arr = [];
  for (let i = 1; i < $rs.length; i++) {
    const $ds = $rs.eq(i).children('td');
    for (let j = 1; j < $ds.length; j++) {
      const $e = $ds.eq(j);
      const _epi = $e.text().trim();
      const _mepi = _epi.match(NUM_REG);
      if (_mepi) {
        arr.push(parseInt(_mepi[0]));
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
  const ids = [];

  // Go through every element to get the id and append to ids
  $r.each(function () {
    const href = $(this).children('a').attr('href');
    if (href) {
      const m = href.match(COMIC_URL_REG);
      if (m) {
        ids.push(m[1]);
      } else {
        throw new Error('Error when matching id');
      }
    } else {
      throw new Error('Error finding manga href');
    }
  });

  // Check if there is id
  if (ids.length) {
    return ids;
  }

  throw new Error('No hot manga id found');
}

function getHotMangaWithUrl(url, callback, error) {
  Request.get(url, (res, $) => {
    try {
      var extracted = extractHotMangaId($);
    } catch (err) {
      error(err);
      return;
    }
    callback(extracted);
  }, (err) => {
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
        const _gm = _g.match(COMIC_GENRE_REG);
        manga.info.genre_dir = _gm ? _gm[1] : '';
        const _as = $t1.eq(4).children('td').text().trim()
          .split(' ');
        manga.info.author = _as[_as.length - 1];
        const $tags = $t1.eq(12).children('td').children('a');
        const _ta = Array.apply(1, { length: $tags.length });
        manga.info.tags = _ta.map((n, i) => $tags.eq(i).text()).filter(t => t != '');
        const _src = $t1.eq(6).find('img').last().attr('src');
        manga.info.ended = _src && (_src.indexOf('9') > 0);

        // Get Description
        const $t2 = $m.eq(1).find('tbody tr td fieldset table tbody tr td');
        manga.info.description = $t2.text().trim();

        // Get books and episodes
        const $t3 = $m.eq(2).find('tbody tr td fieldset table');
        if ($t3.length == 1) {
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
        Request.get(BASE_URL + epiHref, (res, $) => {
          const src = $('body > table > tbody > tr').eq(4).children('td')
            .children('table')
            .children('tbody')
            .children('tr')
            .eq(0)
            .children('td')
            .eq(0)
            .children('a')
            .children('img')
            .attr('src');
          if (src) {
            const msrc = src.match(COMIC_IMG_SRC_REG);
            if (msrc) {
              manga.dmk_id_web = msrc[1];
              manga.dmk_id_gen = msrc[2];
              callback(manga);
            } else {
              error(new Error('Img src info extraction error'));
            }
          } else {
            Debug.error(`Error extracting manga ${dmkId} img src info`);
            error(new Error('Img src info extraction error'));
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
    str = str.trim();
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
      let $r = $rs.eq(2);

      // Check if
      if ($r.text().indexOf('抱歉，資料庫找不到該漫畫。') >= 0) {
        callback([]);
      } else {
        const ids = [];
        for (let i = 4; i < $rs.length; i += 2) {
          $r.append($rs.eq(i).children());
        }
        $r = $r.children();
        $r.each(function () {
          const $a = $(this).children('a');
          const href = $a.attr('href');
          const title = $a.text();
          if (href) {
            const m = href.match(COMIC_URL_REG);
            if (m) {
              ids.push({
                dmk_id: m[1],
                title,
              });
            } else {
              error(new Error('Error when matching id'));
            }
          } else {
            error(new Error('Error finding manga href'));
          }
        });
        callback(ids);
      }
    }, error);
  },
};
