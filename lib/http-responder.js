module.exports = {
  setup: function (res) {
    return function (err, reponse) {
      if (err) {
        res.json(err);
      } else {
        res.json(reponse);
      }
    };
  }
};

