const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const settingController = {
  // Get all settings
  getAllSettings: async (req, res) => {
    try {
      const settings = await prisma.systemSetting.findMany();
      // Format as key-value pair for easier frontend usage
      const settingsMap = {};
      settings.forEach(s => {
        settingsMap[s.key] = s.value;
      });

      res.status(200).json({
        success: true,
        data: settingsMap
      });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Update multiple settings at once
  updateSettings: async (req, res) => {
    try {
      const updates = req.body; // Expecting an object like { GOOGLE_MAPS_KEY: '...', SMTP_SERVER: '...' }
      
      const updatePromises = Object.keys(updates).map(key => {
        return prisma.systemSetting.upsert({
          where: { key: key },
          update: { value: String(updates[key]) },
          create: { key: key, value: String(updates[key]) }
        });
      });

      await Promise.all(updatePromises);

      res.status(200).json({
        success: true,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = settingController;
