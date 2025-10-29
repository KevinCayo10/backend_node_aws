import axios from "axios";

// Use a shared axios instance and bypass system proxy for localhost calls
const http = axios.create({ proxy: false, timeout: 10000 });

export const createAndConfirmOrder = async (event) => {
  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { customer_id, items, idempotency_key, correlation_id } = body || {};

    if (!customer_id || !Array.isArray(items)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid input: customer_id or items missing",
        }),
      };
    }

    const customerUrl = `${process.env.CUSTOMERS_API_BASE}/customers/internal/${customer_id}`;
    const customerResp = await http.get(customerUrl, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("🦁 - INFO - Customer response:", customerResp.data.data.id);
    if (!customerResp.data?.data?.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Customer not valid" }),
      };
    }

    // Map DTO to Orders API expectations
    const orderPayload = {
      customerId: customer_id,
      items: (items || []).map((it) => ({
        productId: it.product_id ?? it.productId,
        qty: it.qty,
      })),
    };

    console.log("🦁 - INFO - Order payload:", orderPayload);
    console.log("🦁 - INFO - Orders API base:", process.env.ORDERS_API_BASE);
    
    const createOrderUrl = `${process.env.ORDERS_API_BASE}/orders`;
    const orderResp = await http.post(createOrderUrl, orderPayload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("🎉 - INFO - Order response:", orderResp);
    const orderId =
      orderResp?.data?.data?.insertId ||
      orderResp?.data?.id ||
      orderResp?.data?.data?.id;
    if (!orderId) {
      throw new Error("Order id not found in Orders API response");
    }

    const confirmUrl = `${process.env.ORDERS_API_BASE}/orders/${orderId}/confirm`;
    const confirmResp = await http.post(
      confirmUrl,
      {},
      { headers: { "X-Idempotency-Key": idempotency_key, "Content-Type": "application/json" } }
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        correlationId: correlation_id,
        data: {
          customer: customerResp.data,
          order: confirmResp.data,
        },
      }),
    };
  } catch (err) {
    console.error("Error in orchestrator:", err.response?.data || err.message);
    return {
      statusCode: err.response?.status || 500,
      body: JSON.stringify({
        error: err.message,
        details: err.response?.data || null,
      }),
    };
  }
};
