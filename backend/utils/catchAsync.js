module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      console.error('Async Erreur: ', err);
      next(err);
    });
  };
};
