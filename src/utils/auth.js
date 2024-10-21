import jwt from "jsonwebtoken";

// Secret key for token validation (stored in your environment variables)
const SECRET_KEY = process.env.JWT_SECRET;

/**
 * Validate the JWT from the Authorization header.
 * @param {Request} req - The HTTP request object
 * @returns {Object} - Returns an object with either user info (if token is valid) or an error message.
 */
export function validateToken(req) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      valid: false,
      message: "No token provided!",
    };
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, SECRET_KEY);
    return {
      valid: true,
      decoded, // Return the decoded token (contains user data like id, role, etc.)
    };
  } catch (error) {
    return {
      valid: false,
      message: "Invalid or expired token!",
    };
  }
}
