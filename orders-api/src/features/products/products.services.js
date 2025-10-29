import pool from "../../core/db.js";

export const listProductsService = async () => {
  const [rows] = await pool.query("SELECT * FROM Product");
  return rows;
};

export const getProductByIdService = async (id) => {
  const [rows] = await pool.query("SELECT * FROM Product WHERE id = ?", [id]);
  return rows[0];
};

export const createProductService = async (product) => {
  const [result] = await pool.query(
    "INSERT INTO Product (sku, name, priceCents, stock) VALUES (?, ?, ?, ?)",
    [product.sku, product.name, product.priceCents, product.stock]
  );
  return result[0];
};

export const updateProductService = async (id, product) => {
  const [result] = await pool.query(
    "UPDATE Product SET sku = ?, name = ?, priceCents = ?, stock = ? WHERE id = ?",
    [product.sku, product.name, product.priceCents, product.stock, id]
  );
  return result[0];
};

export const deleteProductService = async (id) => {
  const [result] = await pool.query("DELETE FROM Product WHERE id = ?", [id]);
  return result[0];
};
