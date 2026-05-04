import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createReport } from "../data/reports.js";

const router = Router();

router.post("/center/:centerId", requireAuth, async (req, res) => {
  try {
    const { issueType, description } = req.body;

    await createReport(
      req.params.centerId,
      req.session.user._id,
      issueType,
      description
    );

    res.redirect(`/centers/${req.params.centerId}`);
  } catch (e) {
    res.status(400).render("error", {
      title: "Error",
      message: e.message || e
    });
  }
});

export default router;