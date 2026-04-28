import { Router } from "express";
import { getCenterById, getAllCenters } from "../data/centers.js";
import { addReview, getReviewsByCenter, deleteReview } from "../data/reviews.js";
import { createReport } from "../data/reports.js";
import { requireAuth } from "../middleware/auth.js";
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
// GET /trending - trending tab
router.get("/trending", async (req, res) => {
  try {
    const centerList = await getAllCenters();

    const trendingCenters = centerList
      .filter((center) => center.borough_name && center.location_name)
      .sort((a, b) => {
    const getScore = (val) => {
      if (!val || val === "N/A") return -1; // push to bottom
      return Number(val);
    };

    const aScore = getScore(a.workstation_number);
    const bScore = getScore(b.workstation_number);
        return bScore - aScore;
      })
      .slice(0, 10);

    res.render("centers/trending", {
      title: "Trending Centers",
      centers: trendingCenters
    });
  } catch (e) {
    res.status(500).render("error", {
      title: "Error",
      message: e.message || e
    });
  }
});

// GET /centers/:id - center detail page
router.get("/:id", async (req, res) => {
  try {
    const center = await getCenterById(req.params.id);
    const reviews = await getReviewsByCenter(req.params.id);
    res.render("centers/detail", { title: center.site_name || "Center Details", center, reviews});
  } catch (e) {
    res.status(404).render("error", { title: "Error", message: e.message});
  }
});

// POST /centers/:id/review - submit a review
router.post("/:id/reviews", requireAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { _id, name } = req.session.user;
    await addReview(req.params.id, _id, name, rating, comment);
    res.redirect(`/centers/${req.params.id}`);
  } catch (e) {
    res.status(400).render("error", { title: "Error", message: e.message });
  }
});

// POST /centers/id:/review/:reviewId/delete - delete a review
router.post("/:id/reviews/:reviewId/delete", requireAuth, async (req, res) => {
  try {
    await deleteReview(req.params.reviewId, req.session.user._id);
    res.redirect(`/centers/${req.params.id}`);
  } catch (e) {
    res.status(400).render("error", { title: "Error", message: e.message });
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
