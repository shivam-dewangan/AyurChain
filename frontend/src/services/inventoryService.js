// Inventory Service using new API
import { batchesAPI } from '@/api/client';

export interface InventoryCheck {
  available: boolean;
  availableQuantity: number;
  message: string;
}

export interface InventorySummary {
  totalQuantity: number;
  availableQuantity: number;
  soldQuantity: number;
  status: string;
}

class InventoryService {
  
  // Check if batch has sufficient quantity for purchase
  async checkAvailability(batchId: string, requestedQuantity: number): Promise<InventoryCheck> {
    try {
      const { data } = await batchesAPI.getById(batchId);
      
      if (!data.success || !data.data) {
        return {
          available: false,
          availableQuantity: 0,
          message: 'Batch not found'
        };
      }

      const batch = data.data;
      const availableQty = batch.available_quantity_kg !== null && batch.available_quantity_kg !== undefined
        ? batch.available_quantity_kg
        : batch.quantity_kg;

      if (batch.status !== 'ready_for_sale') {
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
  }

  // Get inventory summary for a batch
  async getInventorySummary(batchId: string): Promise<InventorySummary | null> {
    try {
      const { data } = await batchesAPI.getById(batchId);
      
      if (!data.success || !data.data) {
        return null;
      }

      const batch = data.data;
      const totalQty = batch.quantity_kg;
      const availableQty = batch.available_quantity_kg !== null && batch.available_quantity_kg !== undefined
        ? batch.available_quantity_kg
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
  }
}

export const inventoryService = new InventoryService();

