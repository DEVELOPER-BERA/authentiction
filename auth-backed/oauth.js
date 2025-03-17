const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      db.query("SELECT * FROM users WHERE google_id = ?", [profile.id], (err, results) => {
        if (err) return done(err);
        
        if (results.length === 0) {
          db.query(
            "INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)",
            [profile.id, profile.displayName, profile.emails[0].value],
            (err) => {
              if (err) return done(err);
              done(null, profile);
            }
          );
        } else {
          done(null, results[0]);
        }
      });
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:5000/auth/facebook/callback",
      profileFields: ["id", "displayName", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      db.query("SELECT * FROM users WHERE facebook_id = ?", [profile.id], (err, results) => {
        if (err) return done(err);

        if (results.length === 0) {
          db.query(
            "INSERT INTO users (facebook_id, name) VALUES (?, ?)",
            [profile.id, profile.displayName],
            (err) => {
              if (err) return done(err);
              done(null, profile);
            }
          );
        } else {
          done(null, results[0]);
        }
      });
    }
  )
);