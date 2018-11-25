function toCamel(str) {
  const cfl = s => s[0].toUpperCase() + s.substring(1);
  return str.split('_').filter(s => s !== '').map((s, i) => (i === 0 ? s : cfl(str))).join('');
}

function clone(data) {
  if (data instanceof Array) {
    return data.map(clone);
  } if (data instanceof Object) {
    return Object.keys(data).reduce((ret, key) => ({
      ...ret,
      [toCamel(key)]: clone(data[key]),
    }), {});
  }
  return data;
}

module.exports = class Manga {
  constructor(obj) {
    this.data = clone(obj);
  }

  id() {
    return this.data.id;
  }

  dmkId() {
    return this.data.dmkId;
  }

  dmkIdGen() {
    return this.data.dmkIdGen;
  }

  dmkIdWeb() {
    return this.data.dmkIdWeb;
  }

  title() {
    return this.data.info.title;
  }

  author() {
    return this.data.info.author;
  }

  description() {
    return this.data.info.description;
  }

  genreDir() {
    return this.data.info.genreDir;
  }

  ended() {
    return this.data.info.ended;
  }

  tags() {
    return this.data.info.tags;
  }

  hasBookList() {
    return this.data.books != null;
  }

  bookList() {
    if (this.hasBookList()) {
      return this.data.books;
    }
    throw new Error(`Manga ${this.dmkId()} doesn't have a book list`);
  }

  isBook(epi) {
    if (this.hasBookList()) return this.data.books.indexOf(epi) >= 0;
    return false;
  }

  episodeList() {
    return this.data.episodes;
  }

  getFirstImageUrl() {
    const firstEpi = this.hasBookList() ? this.data.books[0] : this.data.episodes[0];
    return this.getImageUrl(firstEpi, 1);
  }

  getImageUrl(epi, page) {
    const p3 = itg => itg.toString().padStart(3, '0');
    return `http://${this.data.dmkIdWeb}.cartoonmad.com/${this.data.dmkIdGen}/${this.data.dmkId}/${p3(epi)}/${p3(page)}.jpg`;
  }

  getCoverUrl() {
    return `http://img.cartoonmad.com/ctimg/${this.data.dmkId}.jpg`;
  }

  getCartoonmadUrl() {
    return `http://www.cartoonmad.com/comic/${this.data.dmkId}.html`;
  }

  getSaemangaUrl(epi) {
    return `/manga.html?id=${this.data.dmkId}${epi ? (`&epi=${epi}`) : ''}`;
  }

  lastEpisode() {
    return this.data.episodes[this.data.episodes.length - 1];
  }

  firstEpisode() {
    if (this.data.books) {
      return this.data.books[0];
    }
    return this.data.episodes[0];
  }

  getEpisodeType(epi) {
    if (this.data.books && this.data.books.indexOf(epi) >= 0) {
      return '卷';
    }
    return '话';
  }

  hasPrevEpisode(epi) {
    try {
      this.prevEpisodeOf(epi);
      return true;
    } catch (err) {
      return false;
    }
  }

  prevEpisodeOf(epi) {
    if (this.data.books) {
      const bi = this.data.books.indexOf(epi);
      if (bi >= 0) {
        if (bi > 0) {
          return this.data.books[bi - 1];
        }
        throw new Error(`No prev episode for ${epi}`);
      }
    }
    const ei = this.data.episodes.indexOf(epi);
    if (ei >= 0) {
      if (ei > 0) {
        return this.data.episodes[ei - 1];
      } if (this.data.books) {
        return this.data.books[this.data.books.length - 1];
      }

      throw new Error(`No prev episode for ${epi}`);
    } else {
      throw new Error(`No such episode ${epi}`);
    }
  }

  prevEpisodeUrl(epi) {
    return this.getSaemangaUrl(this.prevEpisodeOf(epi));
  }

  prevEpisodeType(epi) {
    return this.getEpisodeType(this.prevEpisodeOf(epi));
  }

  hasNextEpisode(epi) {
    try {
      this.nextEpisodeOf(epi);
      return true;
    } catch (err) {
      return false;
    }
  }

  nextEpisodeOf(epi) {
    if (this.data.books) {
      const bi = this.data.books.indexOf(epi);
      if (bi >= 0) {
        if (bi + 1 >= this.data.books.length) {
          return this.data.episodes[0];
        }
        return this.data.books[bi + 1];
      }
    }
    const ei = this.data.episodes.indexOf(epi);
    if (ei >= 0) {
      if (ei + 1 >= this.data.episodes.length) {
        throw new Error(`No next episode for ${epi}`);
      } else {
        return this.data.episodes[ei + 1];
      }
    } else {
      throw new Error(`No such episode ${epi}`);
    }
  }

  nextEpisodeUrl(epi) {
    return this.getSaemangaUrl(this.nextEpisodeOf(epi));
  }

  nextEpisodeType(epi) {
    return this.getEpisodeType(this.nextEpisodeOf(epi));
  }
};
