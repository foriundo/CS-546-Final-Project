import { Router } from "express";
import { ObjectId } from "mongodb";
import { requireAdmin } from "../middleware/auth.js";
import { users, centers } from "../config/mongoCollections.js";
import { getAllReports, markReportReviewed, deleteReport} from "../data/reports.js";


const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  try {
    const userCollection = await users();
    const centerCollection = await centers();

    const allUsers = await userCollection
      .find({}, { projection: { hashedPassword: 0 } })
      .toArray();

      allUsers.forEach((user) => {
        user._id = user._id.toString();
        user.canMakeAdmin = user.role !== "admin";
    });

    const totalUsers = await userCollection.countDocuments({});
    const totalCenters = await centerCollection.countDocuments({});
    const adminUsers = await userCollection.countDocuments({ role: "admin" });
    const allReports = await getAllReports();

    for (let report of allReports) {
      const reportingUser = await userCollection.findOne({
        _id: new ObjectId(report.reportedBy)
      });

      report.reportedByName = reportingUser ? reportingUser.name : "Unknown user";
      report.reportedByEmail = reportingUser ? reportingUser.email : "";
    }

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      users: allUsers,
      reports: allReports,
      totalUsers,
      totalCenters,
      adminUsers
    });
  } catch (e) {
    res.status(500).render("error", {
      title: "Error",
      message: e.message || e
    });
  }
});

router.post("/users/:id/delete", requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).render("error", {
        title: "Bad Request",
        message: "Invalid user ID."
      });
    }

    if (req.session.user._id === userId) {
      return res.status(400).render("error", {
        title: "Bad Request",
        message: "You cannot delete your own admin account."
      });
    }

    const userCollection = await users();

    const deleteResult = await userCollection.deleteOne({
      _id: new ObjectId(userId)
    });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "User not found."
      });
    }

    res.redirect("/admin");
  } catch (e) {
    res.status(500).render("error", {
      title: "Error",
      message: e.message || e
    });
  }
});

router.post("/users/:id/make-admin", requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).render("error", {
        title: "Bad Request",
        message: "Invalid user ID."
      });
    }

    const userCollection = await users();

    const updateResult = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: "admin" } }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "User not found."
      });
    }

    res.redirect("/admin");
  } catch (e) {
    res.status(500).render("error", {
      title: "Error",
      message: e.message || e
    });
  }
});

router.post("/reports/:id/reviewed", requireAdmin, async (req, res) => {
  try {
    await markReportReviewed(req.params.id, req.session.user._id);
    res.redirect("/admin");
  } catch (e) {
    res.status(400).render("error", {
      title: "Error",
      message: e.message || e
    });
  }
});

router.post("/reports/:id/delete", requireAdmin, async (req, res) => {
  try {
    await deleteReport(req.params.id);
    res.redirect("/admin");
  } catch (e) {
    res.status(400).render("error", {
      title: "Error",
      message: e.message || e
    });
  }
});

export default router;