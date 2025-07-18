import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";

const verifyToken = async (req, res, next) => {
  try {
    // Extract token from cookies or Authorization header
    const token =
      req.cookies?.jwt || // Cookie-based (preferred for browser use)
      (req.headers.authorization &&
        req.headers.authorization.split(" ")[1]); // Header-based (fallback)

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access Denied, No Token Provided" });
    }

    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ message: "Invalid Token" });
    }

    // Find user from decoded token
    const user = await User.findById(verified.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user to request object
    req.user = user;

    next(); // continue to route
  } catch (error) {
    console.error("Token verification error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export default verifyToken;
