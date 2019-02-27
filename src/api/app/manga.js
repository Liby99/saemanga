function toCamel(str) {
  const cfl = s => s[0].toUpperCase() + s.substring(1);
  return str.split('_').filter(s => s !== '').map((s, i) => (i === 0 ? s : cfl(s))).join('');
}

function clone(data) {
  if (data instanceof Array) {
    return data.map(clone);
  } if (data instanceof Object) {
    return Object.keys(data).reduce((ret, key) => ({
      ...ret,
      [toCamel(key)]: key === '_id' ? data[key].toString() : clone(data[key]),
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

  // dmkIdWeb() {
  //   return this.data.dmkIdWeb;
  // }

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
    if (this.hasBookList()) return this.data.books.some(({ index }) => index === epi);
    return false;
  }

  hasBook(epi) {
    if (this.hasBookList()) {
      return this.data.books.some(({ index }) => index === epi);
    }
    return false;
  }

  hasEpisode(epi) {
    return this.data.episodes.some(({ index }) => index === epi);
  }

  episodeList() {
    return this.data.episodes;
  }

  getPageCount(epi) {
    if (this.data.books) {
      const id = this.data.books.findIndex(({ index }) => index === epi);
      if (id >= 0) {
        return this.data.books[id].pages;
      }
    }
    const id = this.data.episodes.findIndex(({ index }) => index === epi);
    if (id >= 0) {
      return this.data.episodes[id].pages;
    }
    throw new Error(`Episode ${epi} doesn't exist`);
  }

  getFirstImageUrl() {
    const firstEpi = this.hasBookList() ? this.data.books[0] : this.data.episodes[0];
    return this.getImageUrl(firstEpi.index, 1);
  }

  getImageUrl(epi, page) {
    const {
      idVer, dmkIdWeb, dmkIdGen, dmkIdHome, dmkId,
    } = this.data;
    const p3 = itg => itg.toString().padStart(3, '0');
    switch (idVer) {
      case 9: return `http://cartoonmad.com/${dmkIdHome}/${dmkId}/${p3(epi)}/${p3(page)}.jpg`;
      case 8: return `http://cartoonmad.com/${dmkIdHome}/${dmkId}/${p3(epi)}/${p3(page)}.jpg`;
      case 7: return `http://www.cartoonmad.com/home1/${dmkIdGen}/${dmkId}/${p3(epi)}/${p3(page)}.jpg`;
      case 6: return `http://www.cartoonmad.com/cartoonimg/${dmkIdGen}/${dmkId}/${p3(epi)}/${p3(page)}.jpg`;
      case 5: return `http://${dmkIdWeb}.cartoonmad.com/${dmkIdGen}/${dmkId}/${p3(epi)}/${p3(page)}.jpg`;
      default: throw new Error(`Not recognizing version ${idVer}`);
    }
  }

  getCoverUrl() {
    return `http://cartoonmad.com/cartoonimg/coimg/${this.data.dmkId}.jpg`;
  }

  getCartoonmadUrl() {
    return `http://www.cartoonmad.com/comic/${this.data.dmkId}.html`;
  }

  getSaemangaUrl(epi) {
    return `/manga.html?id=${this.data.dmkId}${epi ? (`&epi=${epi}`) : ''}`;
  }

  getFullSaemangaUrl(epi) {
    return `http://saemanga.com${this.getSaemangaUrl(epi)}`;
  }

  lastEpisode() {
    return this.data.episodes[this.data.episodes.length - 1].index;
  }

  firstEpisode() {
    if (this.data.books) {
      return this.data.books[0].index;
    }
    return this.data.episodes[0].index;
  }

  getEpisodeType(epi) {
    if (this.data.books && this.data.books.some(({ index }) => index === epi)) {
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
      const bi = this.data.books.findIndex(({ index }) => index === epi);
      if (bi >= 0) {
        if (bi > 0) {
          return this.data.books[bi - 1].index;
        }
        throw new Error(`No prev episode for ${epi}`);
      }
    }
    const ei = this.data.episodes.findIndex(({ index }) => index === epi);
    if (ei >= 0) {
      if (ei > 0) {
        return this.data.episodes[ei - 1].index;
      } if (this.data.books) {
        return this.data.books[this.data.books.length - 1].index;
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
      const bi = this.data.books.findIndex(({ index }) => index === epi);
      if (bi >= 0) {
        if (bi + 1 >= this.data.books.length) {
          return this.data.episodes[0].index;
        }
        return this.data.books[bi + 1].index;
      }
    }
    const ei = this.data.episodes.findIndex(({ index }) => index === epi);
    if (ei >= 0) {
      if (ei + 1 >= this.data.episodes.length) {
        throw new Error(`No next episode for ${epi}`);
      } else {
        return this.data.episodes[ei + 1].index;
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
