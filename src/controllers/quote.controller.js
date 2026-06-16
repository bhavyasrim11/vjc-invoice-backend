const quoteRepo = require('../repositories/quote.repository');
const { generateQuoteId } = require('../models/quote');

// GET all quotes
const getQuotes = async (req, res) => {
  try {
    const quotes = await quoteRepo.getAllQuotes();
    res.json({ success: true, data: quotes });
  } catch (err) {
    console.error("GET QUOTES ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single quote
const getQuoteById = async (req, res) => {
  try {
    const quote = await quoteRepo.getQuoteById(req.params.id);

    if (!quote) {
      return res
        .status(404)
        .json({ success: false, message: 'Quote not found' });
    }

    res.json({ success: true, data: quote });
  } catch (err) {
    console.error("GET QUOTE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create quote
const createQuote = async (req, res) => {
  try {
    console.log("========== CREATE QUOTE ==========");
    console.log("REQUEST BODY:");
    console.log(JSON.stringify(req.body, null, 2));

    const quote_id = await generateQuoteId();

    console.log("GENERATED QUOTE ID:", quote_id);

    const quote = await quoteRepo.createQuote({
      ...req.body,
      quote_id
    });

    console.log("QUOTE SAVED SUCCESSFULLY");
    console.log(quote);

    res.status(201).json({
      success: true,
      data: quote
    });
  } catch (err) {
    console.error("========== CREATE QUOTE ERROR ==========");
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// PUT update quote
const updateQuote = async (req, res) => {
  try {
    const bodyKeys = Object.keys(req.body);

    if (bodyKeys.length === 1 && bodyKeys[0] === 'status') {
      const quote = await quoteRepo.updateQuoteStatus(
        req.params.id,
        req.body.status
      );

      if (!quote) {
        return res
          .status(404)
          .json({ success: false, message: 'Quote not found' });
      }

      return res.json({
        success: true,
        data: quote
      });
    }

    const quote = await quoteRepo.updateQuote(
      req.params.id,
      req.body
    );

    if (!quote) {
      return res
        .status(404)
        .json({ success: false, message: 'Quote not found' });
    }

    res.json({
      success: true,
      data: quote
    });
  } catch (err) {
    console.error("UPDATE QUOTE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH status only
const updateQuoteStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const quote = await quoteRepo.updateQuoteStatus(
      req.params.id,
      status
    );

    if (!quote) {
      return res
        .status(404)
        .json({ success: false, message: 'Quote not found' });
    }

    res.json({
      success: true,
      data: quote
    });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE quote
const deleteQuote = async (req, res) => {
  try {
    await quoteRepo.deleteQuote(req.params.id);

    res.json({
      success: true,
      message: 'Quote deleted'
    });
  } catch (err) {
    console.error("DELETE QUOTE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  updateQuoteStatus,
  deleteQuote,
};