/**
 * Authentication middleware
 * TODO: Implement JWT verification
 */

const authMiddleware = (req, res, next) => {
  // TODO: Verify JWT token from Authorization header
  // TODO: Extract user_id and attach to req.user
  next();
};

export default authMiddleware;
