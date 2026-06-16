// ============================================================
// FILE: VJC-Invoice-backend/src/routes/payment.routes.js
// ============================================================

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/payment.controller");

router.get("/",              ctrl.getAll);
router.get("/:id",           ctrl.getById);
router.post("/",             ctrl.create);
router.put("/:id/reminder",  ctrl.remind);
router.put("/:id/record",    ctrl.record);
router.put("/:id/void",      ctrl.voidPay);
router.delete("/:id",        ctrl.remove);

module.exports = router;
