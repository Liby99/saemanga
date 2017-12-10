function toCamel(str) {
    var cfl = (str) => str[0].toUpperCase() + str.substring(1);
    return str.split("_").filter((s) => s != "").map((str, i) => i == 0 ? str : cfl(str)).join("");
}

function clone(obj) {
    if (obj instanceof Array) {
        var ret = [];
        for (var i in obj)
            ret[i] = clone(obj[i]);
        return ret;
    }
    else if (obj instanceof Object) {
        var ret = {};
        for (var i in obj)
            ret[toCamel(i)] = clone(obj[i]);
        return ret;
    }
    else {
        return obj;
    }
}

module.exports = class Manga {
    constructor (obj) {
        this.data = clone(obj);
    }
    
    id () {
        return this.data.id;
    }
    
    dmkId () {
        return this.data.dmkId;
    }
    
    dmkIdGen () {
        return this.data.dmkIdGen;
    }
    
    dmkIdWeb () {
        return this.data.dmkIdWeb;
    }
    
    title () {
        return this.data.info.title;
    }
    
    author () {
        return this.data.info.author;
    }
    
    description () {
        return this.data.info.description;
    }
    
    genreDir () {
        return this.data.info.genreDir;
    }
    
    ended () {
        return this.data.info.ended;
    }
    
    tags () {
        return this.data.info.tags;
    }
    
    hasBookList () {
        return this.data.books != null;
    }
    
    bookList () {
        if (this.hasBookList()) {
            return this.data.books;
        }
        else {
            throw new Error("Manga " + this.dmkId() + " doesn't have a book list");
        }
    }
    
    isBook (epi) {
        if (this.hasBookList())
            return this.data.books.indexOf(epi) >= 0;
        return false;
    }
    
    episodeList () {
        return this.data.episodes;
    }
    
    getFirstImageUrl () {
        var firstEpi = this.hasBookList() ? this.data.books[0] : this.data.episodes[0];
        return this.getImageUrl(firstEpi, 1);
    }
    
    getImageUrl (epi, page) {
        var p3 = (n) => n < 10 ? ("00" + n) : n < 100 ? ("0" + n) : n;
        return "http://" + this.data.dmkIdWeb + ".cartoonmad.com/" + this.data.dmkIdGen + "/" + this.data.dmkId + "/" + p3(epi) + "/" + p3(page) + ".jpg";
    }
    
    getCoverUrl () {
        return "http://img.cartoonmad.com/ctimg/" + this.data.dmkId + ".jpg";
    }
    
    getCartoonmadUrl () {
        return "http://www.cartoonmad.com/comic/" + this.data.dmkId + ".html";
    }
    
    getSaemangaUrl (epi) {
        return "/manga.html?id=" + this.data.dmkId + (epi ? ("&epi=" + epi) : "");
    }
    
    lastEpisode () {
        return this.data.episodes[this.data.episodes.length - 1];
    }
    
    firstEpisode () {
        if (this.data.books) {
            return this.data.books[0];
        }
        else {
            return this.data.episodes[0];
        }
    }
    
    getEpisodeType (epi) {
        if (this.data.books && this.data.books.indexOf(epi) >= 0) {
            return "卷";
        }
        else {
            return "话";
        }
    }
    
    hasPrevEpisode (epi) {
        try {
            this.prevEpisodeOf(epi);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    
    prevEpisodeOf (epi) {
        if (this.data.books) {
            var bi = this.data.books.indexOf(epi);
            if (bi >= 0) {
                if (bi > 0) {
                    return this.data.books[bi - 1];
                }
                else {
                    throw new Error("No prev episode for " + epi);
                }
            }
        }
        var ei = this.data.episodes.indexOf(epi);
        if (ei >= 0) {
            if (ei > 0) {
                return this.data.episodes[ei - 1];
            }
            else {
                if (this.data.books) {
                    return this.data.books[this.data.books.length - 1];
                }
                else {
                    throw new Error("No prev episode for " + epi);
                }
            }
        }
        else {
            throw new Error("No such episode " + epi);
        }
    }
    
    prevEpisodeUrl (epi) {
        return this.getSaemangaUrl(this.prevEpisodeOf(epi));
    }
    
    prevEpisodeType (epi) {
        return this.getEpisodeType(this.prevEpisodeOf(epi));
    }
    
    hasNextEpisode (epi) {
        try {
            this.nextEpisodeOf(epi);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    
    nextEpisodeOf (epi) {
        if (this.data.books) {
            var bi = this.data.books.indexOf(epi);
            if (bi >= 0) {
                if (bi + 1 >= this.data.books.length) {
                    return this.data.episodes[0];
                }
                else {
                    return this.data.books[bi + 1];
                }
            }
        }
        var ei = this.data.episodes.indexOf(epi);
        if (ei >= 0) {
            if (ei + 1 >= this.data.episodes.length) {
                throw new Error("No next episode for " + epi);
            }
            else {
                return this.data.episodes[ei + 1];
            }
        }
        else {
            throw new Error("No such episode " + epi);
        }
    }
    
    nextEpisodeUrl (epi) {
        return this.getSaemangaUrl(this.nextEpisodeOf(epi));
    }
    
    nextEpisodeType (epi) {
        return this.getEpisodeType(this.nextEpisodeOf(epi));
    }
}
