import { Router } from "express";
import { getCenterById, getAllCenters, getCentersByFilter } from "../data/centers.js";
import { addReview, getReviewsByCenter, deleteReview } from "../data/reviews.js";
import { createReport } from "../data/reports.js";
import { requireAuth } from "../middleware/auth.js";
import { reviews } from "../config/mongoCollections.js";
import { addRemoveFavorites } from "../data/users.js";

const router = Router();

// GET /centers - list all centers
router.get("/", async (req, res) => {
  try {
    const centerList = await getAllCenters();

    res.render("centers/index", { title: "Public Computer Centers", centers: centerList, filters: {} });
  } catch (e) {
    res.status(500).render("error", { title: "Error", message: e.message });
  }
});

// GET /centers/search - search/filter centers
router.get("/search", async (req, res) => {
  try {
    const filter = {
      name: req.query.name || '',
      borough: req.query.borough || '',
      organizationName: req.query.organizationName || '',
      deviceType: req.query.deviceType || '',
      operatingStatus: req.query.operatingStatus || ''
    };

    const centerList = await getCentersByFilter(filter);

    res.render("centers/index", { title: "Search Results", centers: centerList, filters: filter });
  } catch (e) {
    res.status(500).render("error", { title: "Error", message: e.message });
  }
});
// GET /trending - trending tab
router.get("/trending", async (req, res) => {
  try {
    const centerList = await getAllCenters();
    const reviewCollection = await reviews();

    const reviewStats = await reviewCollection
      .aggregate([
        {
          $group: {
            _id: "$centerId",
            reviewCount: { $sum: 1 },
            averageRating: { $avg: "$rating" }
          }
        },
        {
          $sort: {
            reviewCount: -1,
            averageRating: -1
          }
        },
        {
          $limit: 10
        }
      ])
      .toArray();

    const trendingCenters = reviewStats
      .map((stat) => {
        const center = centerList.find(
          (center) => center._id.toString() === stat._id.toString()
        );

        if (!center) return null;

        return {
          ...center,
          reviewCount: stat.reviewCount,
          averageRating: stat.averageRating.toFixed(1)
        };
      })
      .filter((center) => center !== null);

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
    const centerReviews = await getReviewsByCenter(req.params.id);
    const favorites = (req.session.user && req.session.user.favorites || []).map(id => id.toString());
    const isFavorited = favorites.includes(center._id);
    res.render("centers/detail", { title: center.location_name || "Center Details", center, centerReviews, isFavorited});
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

// POST /centers/:id/report - report an issue
router.post("/:id/report", requireAuth, async (req, res) => {
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
});

// POST /centers/:id/favorite - add/remove a favorite to/from user profile
router.post("/:id/favorite", requireAuth, async (req, res) => {
  try {
    const centerId = req.params.id;
    const userId = req.session.user._id;
    let favorite = await addRemoveFavorites(userId, centerId);
    req.session.user.favorites = favorite;
    
    return res.status(200).json({ favorites: req.session.user.favorites });
  } catch (e) {
    if (typeof e === 'string') {
      res.status(400).json({error: e});
    } else {
      res.status(500).json({error: e.message});
    }
  }
});

export default router;
