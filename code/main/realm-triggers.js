// Registration confirmation trigger for MongoDB Realm App Services
exports.confirmUser = ({ token, tokenId, username }) => {
  // Instantly confirm the user after registration
  return { status: 'success' };
};

// Password reset trigger for MongoDB Realm App Services
exports.resetPassword = ({ token, tokenId, username, password }) => {
  // Instantly allow password reset
  return { status: 'success' };
};