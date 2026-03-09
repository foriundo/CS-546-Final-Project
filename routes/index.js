import centersRoutes from "./centers.js";
import authRoutes from "./auth.js";       // uncomment when ready
// import reviewsRoutes from "./reviews.js"; // uncomment when ready
// import favoritesRoutes from "./favorites.js"; // uncomment when ready

const constructorMethod = (app) => {
  app.use("/centers", centersRoutes);
  app.use("/auth", authRoutes);
  // app.use("/reviews", reviewsRoutes);
  // app.use("/favorites", favoritesRoutes);

  app.get("/", (req, res) => {
    res.redirect("/centers");
  });

  app.use("*", (req, res) => {
    res.status(404).render("error", { title: "404", message: "Page not found." });
  });
};

export default constructorMethod;
