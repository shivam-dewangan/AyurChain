const Batch = require('../models/Batch');

// Check if batch has sufficient quantity for purchase
const checkAvailability = async (batchId, requestedQuantity) => {
  try {
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return {
        available: false,
        availableQuantity: 0,
        message: 'Batch not found'
      };
    }

    const availableQty = batch.availableQuantityKg !== null && batch.availableQuantityKg !== undefined
      ? batch.availableQuantityKg
      : batch.quantityKg;

    if (batch.status !== 'ready_for_sale' && batch.status !== 'approved_for_sale') {
      return {
        available: false,
        availableQuantity: availableQty,
        message: 'Batch is not available for sale'
      };
    }

    if (availableQty <= 0) {
      return {
        available: false,
        availableQuantity: 0,
        message: 'Batch is sold out'
      };
    }

    if (requestedQuantity > availableQty) {
      return {
        available: false,
        availableQuantity: availableQty,
        message: `Only ${availableQty} kg available`
      };
    }

    return {
      available: true,
      availableQuantity: availableQty,
      message: 'Available for purchase'
    };
  } catch (error) {
    return {
      available: false,
      availableQuantity: 0,
      message: 'Error checking availability'
    };
  }
};

// Update inventory after purchase
const updateInventoryAfterPurchase = async (batchId, purchasedQuantity) => {
  try {
    const batch = await Batch.findById(batchId);

    if (!batch) {
      throw new Error('Batch not found');
    }

    const currentAvailable = batch.availableQuantityKg !== null && batch.availableQuantityKg !== undefined
      ? batch.availableQuantityKg
      : batch.quantityKg;
    
    const currentSold = batch.soldQuantityKg || 0;
    const newAvailable = currentAvailable - purchasedQuantity;
    const newSold = currentSold + purchasedQuantity;
    const newStatus = newAvailable <= 0 ? 'sold' : 'ready_for_sale';

    batch.availableQuantityKg = newAvailable;
    batch.soldQuantityKg = newSold;
    batch.status = newStatus;

    await batch.save();

    return true;
  } catch (error) {
    console.error('Error updating inventory:', error);
    return false;
  }
};

// Get inventory summary for a batch
const getInventorySummary = async (batchId) => {
  try {
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return null;
    }

    const totalQty = batch.quantityKg;
    const availableQty = batch.availableQuantityKg !== null && batch.availableQuantityKg !== undefined
      ? batch.availableQuantityKg
      : totalQty;
    const soldQty = totalQty - availableQty;

    return {
      totalQuantity: totalQty,
      availableQuantity: availableQty,
      soldQuantity: soldQty,
      status: batch.status
    };
  } catch (error) {
    console.error('Error getting inventory summary:', error);
    return null;
  }
};

module.exports = {
  checkAvailability,
  updateInventoryAfterPurchase,
  getInventorySummary
};

