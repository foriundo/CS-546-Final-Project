import { Router } from "express";
import { getUserById } from "../data/users.js";
import { getCenterById } from "../data/centers.js";
import { getReportsByUser } from "../data/reports.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();

// GET 
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = req.session.user;
    const favorites = user.favorites || [];
    let reports = await getReportsByUser(user._id);
    reports = await Promise.all(reports.map(async (report) => {
        const center = await getCenterById(report.centerId.toString());
        return {...report, centerName: center.location_name}}));

    let userInfo = {
        "username": user.name,
        "email": user.email,
        "reports": reports,
        "reviews": [],
        "favorites": await Promise.all(favorites.map(id => getCenterById(id))),
    }
    res.render("profile", { title: "User Profile", userInfo });
  } catch (e) {
    res.status(500).render("error", { title: "Error", message: e.message });
  }
});
