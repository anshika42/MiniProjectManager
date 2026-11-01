const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization && authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
}

module.exports = requireAuth;
