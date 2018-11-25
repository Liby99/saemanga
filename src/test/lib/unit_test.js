/* eslint no-console: off */

function afterTest(obj) {
  if (obj.finish) obj.finish();
}

function afterBegin(obj) {
  (function t(i) {
    if (i < obj.tests.length) {
      obj.tests[i](() => {
        t(i + 1);
      }, (err) => {
        if (err) {
          console.error(err);
        }
        afterTest(obj);
      });
    } else {
      afterTest(obj);
    }
  }(0));
}

module.exports = (obj) => {
  if (obj.begin) obj.begin(() => afterBegin(obj));
  else afterBegin(obj);
};
