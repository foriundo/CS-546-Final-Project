import { Router } from "express";
import { getUserById } from "../data/users.js";
import { getCenterById } from "../data/centers.js";
import { getReportsByUser } from "../data/reports.js";
import { requireAuth } from "../middleware/auth.js";
import { getReviewsByUser } from "../data/reviews.js";

const router = Router();

// GET 
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = req.session.user;
    const favorites = user.favorites || [];
    let reviews = await getReviewsByUser(user._id);
    
    reviews = await Promise.all(reviews.map(async (review) => {
      try {
        const center = await getCenterById(review.centerId.toString());
        return {...review, centerName: center.location_name};
      } catch (e) {
        return {...review, centerName: "Unknown Center"};
      }
    }));
    
    let reports = await getReportsByUser(user._id);
    reports = await Promise.all(reports.map(async (report) => {
      try {
        const center = await getCenterById(report.centerId.toString());
        return {...report, centerName: center.location_name};
      } catch (e) {
          return {...report, centerName: "Unknown Center"};
      }
    }));

    let userInfo = {
        "username": user.name,
        "email": user.email,
        "reports": reports,
        "reviews": reviews,
        "favorites": await Promise.all(favorites.map(id => getCenterById(id))),
    }
    res.render("profile/userProfile", { title: "User Profile", userInfo });
  } catch (e) {
    res.status(500).render("error", { title: "Error", message: e.message });
  }
});

export default router;
