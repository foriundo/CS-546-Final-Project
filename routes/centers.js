import { Router } from "express";
import {
  getAllCenters,
  getCenterById,
  getCentersByFilter,
} from "../data/centers.js";

const router = Router();

const DAY_FIELDS = ["sun_open", "mon_open", "tue_open", "wed_open", "thu_open", "fri_open", "sat_open"];

const addOpenStatus = (centers) => {
  const today = DAY_FIELDS[new Date().getDay()];
  return centers.map((c) => ({ ...c, openToday: c[today] !== "Closed" }));
};

// GET /centers - list all centers
router.get("/", async (req, res) => {
  try {
    const centerList = addOpenStatus(await getAllCenters());
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

    const centerList = addOpenStatus(await getCentersByFilter(filters));

    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json(centerList);
    }

    res.render("centers/index", {
      title: "Search Results",
      centers: centerList,
      filters: req.query,
    });
  } catch (e) {
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(500).json({ error: e.message });
    }
    res.status(500).render("error", { title: "Error", message: e.message });
  }
});

// GET /centers/:id - center detail page
router.get("/:id", async (req, res) => {
  try {
    const center = await getCenterById(req.params.id);
    const today = DAY_FIELDS[new Date().getDay()];
    center.openToday = center[today] !== "Closed";
    res.render("centers/detail", { title: center.location_name, center });
  } catch (e) {
    res.status(404).render("error", { title: "Not Found", message: e.message });
  }
});

export default router;
