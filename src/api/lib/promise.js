module.exports = {
  all(arr, func, cb, error) {
    let c = 0;
    const take = () => ++c === arr.length && cb(); // eslint-disable-line no-plusplus
    arr.forEach((elem, i) => func(elem, i, take, error));
  },
};
