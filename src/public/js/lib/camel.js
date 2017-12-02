function toCamel(str) {
    var cfl = (str) => str[0].toUpperCase() + str.substring(1);
    return str.split("_").filter((s) => s != "").map((str, i) => i == 0 ? str : cfl(str)).join("");
}

function toUnderscore(str) {
    return str.replace(/\.?([A-Z]+)/g, (x, y) => "_" + y.toLowerCase()).replace(/^_/, "");
}
