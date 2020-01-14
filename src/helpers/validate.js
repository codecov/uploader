function validateToken(token) {
  let re = /^\w+$/g;
  let result = token.match(re);
  return true ? result != null : false;
}

module.exports = {
  validateToken
};
