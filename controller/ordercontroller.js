const Order = require("../models/Order");

// Create order
const createOrder = async (req, res) => {
  try {
    const { userId, productId, address } = req.body;
    const newOrder = new Order({ userId, productId, address });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders by user
const getOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).populate("productId");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, getOrders };
