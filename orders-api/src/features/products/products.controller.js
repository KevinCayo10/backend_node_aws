import {
  createProductService,
  getProductByIdService,
  listProductsService,
  updateProductService,
} from "./products.services.js";

export const listProducts = async (req, res, next) => {
  try {
    const products = await listProductsService();
    res.json({
      status: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await getProductByIdService(id);
    res.json({
      status: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await createProductService(req.body);
    res.json({
      status: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await updateProductService(id, req.body);
    res.json({
      status: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await deleteProductService(id);
    res.json({
      status: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
