// Requires that the authenticated user is acting on APIs pertinent to their own account.
// Checks that the Bearer Token contains an id that matches the id in the url parametre.
// Must be called after authMiddleware.
const authSelf = async (req, res, next) => {
  try {
    if (req.id !== req.params.id) {
      return res.status(403).json({ message: 'User is not authorized to access this resource' });
    }

    next();
  } catch (error) {
    res.status(403);
    throw err;
  }
};

export default authSelf;
