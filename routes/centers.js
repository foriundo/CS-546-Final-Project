import { Router } from "express";
import {
  getAllCenters,
  getCenterById,
  getCentersByFilter,
} from "../data/centers.js";

const router = Router();

// GET /centers - list all centers
router.get("/", async (req, res) => {
  try {
    const centerList = await getAllCenters();
    res.render("centers/index", {
      title: "Public Computer Centers",
      centers: centerList,
    });
  } catch (e) {
    res.status(500).render("error", { title: "Error", message: e.message });
  }
});

// GET /centers/search - search/filter centers
router.get("/search", async (req, res) => {
  try {
    const { borough, deviceType, operatingStatus, search } = req.query;
    const filters = {};
    if (borough) filters.borough = borough;
    if (deviceType) filters.deviceType = deviceType;
    if (operatingStatus) filters.operatingStatus = operatingStatus;
    if (search) filters.search = search;

    const centerList = await getCentersByFilter(filters);
    res.render("centers/index", {
      title: "Search Results",
      centers: centerList,
      filters: req.query,
    });
  } catch (e) {
    res.status(500).render("error", { title: "Error", message: e.message });
  }
});

// GET /centers/:id - center detail page
router.get("/:id", async (req, res) => {
  try {
    const center = await getCenterById(req.params.id);
    res.render("centers/detail", { title: center.location_name, center });
  } catch (e) {
    res.status(404).render("error", { title: "Not Found", message: e.message });
  }
});

export default router;
