const itemService = require('../services/item.service');

const itemController = {

  getAll: async (req, res) => {
    try {
      const { search, status, category } = req.query;
      const data = await itemService.getAllItems({ search, status, category });
      res.json({ success: true, ...data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const item = await itemService.getItemById(req.params.id);
      res.json({ success: true, item });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const item = await itemService.createItem(req.body);
      res.status(201).json({ success: true, item });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const item = await itemService.updateItem(req.params.id, req.body);
      res.json({ success: true, item });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await itemService.deleteItem(req.params.id);
      res.json({ success: true, message: 'Item deleted!' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
};

module.exports = itemController;