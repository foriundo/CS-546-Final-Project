import express from "express";
import { engine } from "express-handlebars";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import constructorMethod from "./routes/index.js";
import configRoutes from "./routes/index.js";
import { createUserIndexes} from "./data/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Handlebars
app.engine("handlebars", engine({
  defaultLayout: "main",
  helpers: {
    eq: (a, b) => a === b
  }
}));
app.set("view engine", "handlebars");
app.set("views", join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, "public")));

// Session
app.use(
  session({
    name: "AuthState",
    secret: "some secret string",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
constructorMethod(app);
configRoutes(app);

const start = async () => {
  await createUserIndexes();

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
};

start();
