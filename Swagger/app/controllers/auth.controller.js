const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const db = require("../models");
const Users = db.user;

passport.use(
  new localStrategy(
    { usernameField: "username" },
    async (username, password, done) => {
      try {
        const user = await Users.findOne({ where: { username: username } });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid password" });
        }
        const role = await Users.findOne({ where: { role: role } });
        if (!role) {
          return done(null, false, { message: "Role not found" });
        }

        // match the role with user
        if (role !== user.role) {
          return done(null, false, { message: "Role not matched" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;

// register user
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    // check if username already exists
    const user = await Users.findOne({ where: { username: username } });
    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    } else {
      const verificationToken = crypto.randomBytes(16).toString("hex");
      const user = await Users.create({
        username: username,
        email: email,
        role: role,
        status: "inActive",
        password: hashedPassword,
        isVerified: false,
        verificationToken: verificationToken,
      });
      req.login(user, (error) => {
        if (error) {
          console.error(error);
          return res.redirect("/login");
        }
        return res.redirect("/dashboard");
      });
    }
  } catch (error) {
    console.error(error);
    return res.redirect("/register");
  }
};

// login user
exports.login = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    passport.authenticate("local", (error, user, info) => {
      if (error) {
        console.error(error);
        return res.redirect("/login");
      }
      if (!user) {
        console.error(info.message);
        return res.redirect("/login");
      }
      req.login(user, (error) => {
        if (error) {
          console.error(error);
          return res.redirect("/login");
        }
        return res.redirect("/dashboard");
      });
    })(req, res);
  } catch (error) {}
};
