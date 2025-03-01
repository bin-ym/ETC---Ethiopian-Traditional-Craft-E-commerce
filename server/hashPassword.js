const bcrypt = require("bcrypt");

const plaintextPassword = "1234";
const saltRounds = 10; // Matches your server.js setup

bcrypt.hash(plaintextPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err);
    return;
  }
  console.log("Hashed Password:", hash);
});