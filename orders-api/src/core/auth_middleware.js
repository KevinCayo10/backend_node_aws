import jwt from "jsonwebtoken";

export const requireJwt = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: "No token" });
  const token = h.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// For internal calls (Orders->Customers)
export const requireServiceToken = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: "No token" });
  const token = h.split(" ")[1];
  if (token !== process.env.SERVICE_TOKEN)
    return res.status(401).json({ error: "Invalid service token" });
  next();
};
