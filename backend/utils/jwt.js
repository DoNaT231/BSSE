import jwt from "jsonwebtoken";

export function generateAccessToken(user) {
  console.log("niga", user)
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      user_type: user.user_type,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}