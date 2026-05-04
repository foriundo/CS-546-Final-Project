import centersRoutes from "./centers.js";
import authRoutes from "./auth.js";
import adminRoutes from "./admin.js";
import profileRoutes from "./profile.js";
import reportRoutes from "./reports.js";

const constructorMethod = (app) => {
  app.use("/centers", centersRoutes);
  app.use("/auth", authRoutes);
  app.use("/admin", adminRoutes);
  app.use("/profile", profileRoutes);
  app.use("/reports", reportRoutes);
  app.get("/", (req, res) => {
    res.redirect("/centers");
  });

  app.use("*", (req, res) => {
    res.status(404).render("error", { title: "404", message: "Page not found." });
  });
};

export default constructorMethod;
