import { Router } from "express";
import { getCenterById, getAllCenters, getCentersByFilter, createCenter, updateCenter, deleteCenter } from "../data/centers.js";
import { addReview, getReviewsByCenter, deleteReview } from "../data/reviews.js";
import { createReport } from "../data/reports.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { reviews } from "../config/mongoCollections.js";
import { addRemoveFavorites } from "../data/users.js";
import { ObjectId } from "mongodb";

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
          $limit: 5
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

router.get("/add", requireAdmin, async (req, res) => {
  res.render("centers/add", {
    title: "Add Center"
  });
});

router.post("/add", requireAdmin, async (req, res) => {
  try {
    const newCenter = await createCenter(req.body);
    res.redirect(`/centers/${newCenter._id}`);
  } catch (e) {
    res.status(400).render("centers/add", {
      title: "Add Center",
      error: e.message || e,
      formData: req.body
    });
  }
});

router.get("/:id/edit", requireAdmin, async (req, res) => {
  try {

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).render("error", { title: "Error", message: "Invalid center id" });
    }

    const center = await getCenterById(req.params.id);

    res.render("centers/edit", { title: "Edit Center", center });
  } catch (e) {
    res.status(404).render("error", { title: "Error", message: e.message || e });
  }
});

router.post("/:id/edit", requireAdmin, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).render("error", { title: "Error", message: "Invalid center id" });
    }
    
    const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    const websiteRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;
    const validTimeRange = /^((0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM) - (0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)|Closed|Unavailable)$/i;
    const hourFields = [ "mon_open", "tue_open", "wed_open", "thu_open", "fri_open", "sat_open", "sun_open"];

    if (req.body.full_location_phone_number) {

      req.body.full_location_phone_number = req.body.full_location_phone_number.trim();

      if ( req.body.full_location_phone_number.toLowerCase() === "n/a") {
        req.body.full_location_phone_number = "N/A";
      }

      if ( req.body.full_location_phone_number !== "N/A" && !phoneRegex.test(req.body.full_location_phone_number) ) {

        return res.status(400).render("centers/edit", { title: "Edit Center", error: "Phone number must be a valid 10 digit phone number", center: {
            _id: req.params.id,
            ...req.body
          }
        });

      }
    }

    if (req.body.website) {

      req.body.website = req.body.website.trim();

      if (req.body.website.toLowerCase() === "n/a") {
        req.body.website = "N/A";
      }

      if ( req.body.website !== "N/A" && !websiteRegex.test(req.body.website)) {

        return res.status(400).render("centers/edit", { title: "Edit Center", error: "Website must be a valid URL", center: {
            _id: req.params.id,
            ...req.body
          }
        });

      }
    }

    for (let field of hourFields) {

      if (req.body[field]) {

        req.body[field] = req.body[field].trim();

        if (req.body[field].toLowerCase() === "closed") {
          req.body[field] = "Closed";
        }

        if (req.body[field].toLowerCase() === "unavailable") {
          req.body[field] = "Unavailable";
        }

        if (!validTimeRange.test(req.body[field])) {

          return res.status(400).render("centers/edit", {
            title: "Edit Center",
            error: "Hours must be in format 8:00 AM - 4:00 PM, Closed, or Unavailable",
            center: {
              _id: req.params.id,
              ...req.body
            }
          });

        }
      }
    }

    const updatedCenter = await updateCenter(req.params.id, req.body);
    res.redirect(`/centers/${updatedCenter._id}`);
  } catch (e) {
    let center;

    try {
      center = await getCenterById(req.params.id);
    } catch {
      center = {
        _id: req.params.id,
        ...req.body
      };
    }

    res.status(400).render("centers/edit", {
      title: "Edit Center",
      error: e.message || e,
      center
    });
  }
});

router.post("/:id/delete", requireAdmin, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).render("error", {title: "Error", message: "Invalid center id"});
    }
    await deleteCenter(req.params.id);
    res.redirect("/centers");
  } catch (e) {
    res.status(400).render("error", {
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
    res.status(404).render("error", { title: "Error", message: e.message || e });
  }
});

// POST /centers/:id/review - submit a review
router.post("/:id/reviews", requireAuth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).render("error", {title: "Error", message: "Invalid center id"});
    }
    const { rating, comment } = req.body;
    const { _id, name } = req.session.user;
    await addReview(req.params.id, _id, name, rating, comment);
    res.redirect(`/centers/${req.params.id}`);
  } catch (e) {
    const center = await getCenterById(req.params.id);
    const centerReviews = await getReviewsByCenter(req.params.id);
    const favorites = (req.session.user && req.session.user.favorites || []).map(id => id.toString());
    const isFavorited = favorites.includes(center._id);
    res.status(400).render("centers/detail", {
      title: center.location_name || "Center Details",
      center,
      centerReviews,
      isFavorited,
      reviewError: e.message || e
    })
  }
});

// POST /centers/id:/review/:reviewId/delete - delete a review
router.post("/:id/reviews/:reviewId/delete", requireAuth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).render("error", {title: "Error", message: "Invalid center id"});
    }
    await deleteReview(req.params.reviewId, req.session.user._id);
    res.redirect(`/centers/${req.params.id}`);
  } catch (e) {
    res.status(400).render("error", { title: "Error", message: e.message || e });
  }
});

// POST /centers/:id/report - report an issue
router.post("/:id/report", requireAuth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid center id" });
    }
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
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid center id" });
    }
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
