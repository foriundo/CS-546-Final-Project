import { Router } from "express";
import { getAllCenters, getCentersByFilter, getCenterById } from "../data/centers.js";
const router = Router();

// GET /centers - list all centers
router.get("/", async (req, res) => {
  try {
    const centerList = await getAllCenters();

    res.render("centers/index", { title: "Public Computer Centers", centers: centerList });
  } catch (e) {
    res.status(500).render("error", { title: "Error", message: e.message });
  }
});

// GET /centers/search - search/filter centers
router.get("/search", async (req, res) => {
  try {
    const filter = {
      name: req.query.name, 
      borough: req.query.borough,
      organizationName: req.query.organizationName
    };

    const centerList = await getCentersByFilter(filter);

    res.render("centers/index", { title: "Search Results", centers: centerList });
  } catch (e) {
    res.status(500).render("error", { title: "Error", message: e.message });
  }
});

// GET /centers/:id - center detail page
router.get("/:id", async (req, res) => {
  try {
    const center = await getCenterById(req.params.id);
    res.render("centers/detail", { title: "Center Details", center: center });
  } catch (e) {
    res.status(404).render("error", { title: "Error", message: e.message });
  }
});

export default router;
