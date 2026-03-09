export const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(403).render("error", {
      title: "Access Denied",
      error: "You must be logged in to access this page."
    });
  }

  next();
};

export const requireGuest = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/");
  }

  next();
};