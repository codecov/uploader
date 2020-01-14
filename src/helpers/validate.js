function validateToken(token) {
  let re = "[/w]+";
  return token.match(re);
}

module.exports = {
  validateToken
};
