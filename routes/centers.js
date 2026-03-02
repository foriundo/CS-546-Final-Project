import { Router } from "express";
const router = Router();

// GET /centers - list all centers
router.get("/", async (req, res) => {
  try {
    // TODO: call getAllCenters() from data layer
    res.render("centers/index", { title: "Public Computer Centers" });
  } catch (e) {
    res.status(500).render("error", { title: "Error", message: e.message });
  }
});

// GET /centers/search - search/filter centers
router.get("/search", async (req, res) => {
  try {
    // TODO: call getCentersByFilter() from data layer
    res.render("centers/index", { title: "Search Results" });
  } catch (e) {
    res.status(500).render("error", { title: "Error", message: e.message });
  }
});

// GET /centers/:id - center detail page
router.get("/:id", async (req, res) => {
  try {
    // TODO: call getCenterById() from data layer
    res.render("centers/detail", { title: "Center Details" });
  } catch (e) {
    res.status(404).render("error", { title: "Error", message: e.message });
  }
});

export default router;
