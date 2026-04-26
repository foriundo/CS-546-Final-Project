import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createReport } from "../data/reports.js";
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

// POST /centers/:id/report
router.post("/centers/:id/report", requireAuth, async (req, res) => {
  try {
    const centerId = req.params.id;
    const userId = req.session.user._id;
    const issueType = req.body.issueType;
    const description = req.body.description;
    const report = await createReport(centerId, userId, issueType, description);
    return res.status(201).json({report});
  } catch (e) {
    if (typeof e === 'string') {
      res.status(400).json({error: e});
    } else {
      res.status(500).json({error: e.message});
    }
  }
})

export default router;
