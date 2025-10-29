import {
  createCustomerService,
  deleteCustomerService,
  getCustomerByIdService,
  searchCustomersService,
  updateCustomerService,
} from "./customers.services.js";
import { createSchema } from "./customers.model.js";

export const createCustomer = async (req, res, next) => {
  try {
    const dto = createSchema.parse(req.body);
    const customer = await createCustomerService(dto);
    res.status(201).json({
      status: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await getCustomerByIdService(id);
    res.json({
      status: true,
      message: "Customer fetched successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerByIdInternal = async (req, res, next) => {
  return getCustomerById(req, res, next);
};

export const searchCustomers = async (req, res, next) => {
  try {
    const { search, cursor, limit = 10 } = req.query;
    const result = await searchCustomersService({
      search,
      cursor: Number(cursor),
      limit: Number(limit),
    });
    res.json({
      status: true,
      message: "Customers fetched successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dto = updateSchema.parse(req.body);
    const customer = await updateCustomerService(id, dto);
    res.json({
      status: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteCustomerService(id);
    res.json({
      status: true,
      message: "Customer deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
