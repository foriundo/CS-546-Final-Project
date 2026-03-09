import { Router } from "express";
import { registerUser, loginUser } from "../data/users.js";
import { requireGuest, requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/register", requireGuest, async (req, res) => {
  res.render("auth/register", {
    title: "Register"
  });
});

router.post("/register", requireGuest, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await registerUser(name, email, password);

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email
    };

    return res.redirect("/");
  } catch (e) {
    return res.status(400).render("auth/register", {
      title: "Register",
      error: e,
      formData: { name, email }
    });
  }
});

router.get("/login", requireGuest, async (req, res) => {
  res.render("auth/login", {
    title: "Login"
  });
});

router.post("/login", requireGuest, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await loginUser(email, password);

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email
    };

    return res.redirect("/");
  } catch (e) {
    return res.status(400).render("auth/login", {
      title: "Login",
      error: e,
      formData: { email }
    });
  }
});

router.get("/logout", requireAuth, async (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("AuthState");
    res.redirect("/auth/login");
  });
});

export default router;