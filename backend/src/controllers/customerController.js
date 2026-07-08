const { getCustomerDashboard } = require('../services/customerService');

const getDashboard = async (req, res, next) => {
  try {
    const data = await getCustomerDashboard(req.user.id);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard };
