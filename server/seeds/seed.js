import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Warehouse from '../models/Warehouse.js';
import Location from '../models/Location.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Receipt from '../models/Receipt.js';
import DeliveryOrder from '../models/DeliveryOrder.js';
import InternalTransfer from '../models/InternalTransfer.js';
import StockAdjustment from '../models/StockAdjustment.js';
import StockMove from '../models/StockMove.js';

import connectDB from '../config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();


    // Clear existing collections sequentially to avoid connection pool exhaustion
    console.log('Clearing old collections...');
    const modelsToClear = [
      StockMove,
      StockAdjustment,
      InternalTransfer,
      DeliveryOrder,
      Receipt,
      Product,
      Category,
      Location,
      Warehouse,
      User
    ];
    for (const model of modelsToClear) {
      await model.deleteMany({});
    }

    // 1. Create Users
    console.log('Creating users...');
    const manager = await User.create({
      name: 'Michael Prichett',
      email: 'manager@stocksense.com',
      password: 'password123',
      role: 'inventory_manager',
      phone: '+1234567890'
    });

    const staff = await User.create({
      name: 'Alex Staff',
      email: 'staff@stocksense.com',
      password: 'password123',
      role: 'warehouse_staff',
      phone: '+1987654321'
    });

    // 2. Create Warehouses
    console.log('Creating warehouses...');
    const wh1 = await Warehouse.create({
      name: 'Central Apex Hub',
      code: 'WH01',
      address: 'Plot 42, Logistics Park, Sector 18'
    });

    const wh2 = await Warehouse.create({
      name: 'North Logistics Depot',
      code: 'WH02',
      address: 'Facility 9, Industrial Corridor'
    });

    // 3. Create Locations
    console.log('Creating locations...');
    const locWh1A = await Location.create({
      name: 'Rack Alpha-01',
      code: 'RA-01',
      warehouse: wh1._id,
      type: 'rack'
    });

    const locWh1B = await Location.create({
      name: 'Floor Zone Beta',
      code: 'FZ-01',
      warehouse: wh1._id,
      type: 'floor'
    });

    const locWh1Dock = await Location.create({
      name: 'Receiving Dock 1',
      code: 'RCV-01',
      warehouse: wh1._id,
      type: 'zone'
    });

    const locWh2A = await Location.create({
      name: 'Shelf North-01',
      code: 'SN-01',
      warehouse: wh2._id,
      type: 'shelf'
    });

    // 4. Create Categories
    console.log('Creating categories...');
    const catRaw = await Category.create({
      name: 'Raw Materials',
      description: 'Metals, plastics, raw manufacturing items'
    });

    const catElec = await Category.create({
      name: 'Electronics & Sensors',
      description: 'Microchips, boards, sensors, circuits'
    });

    const catPack = await Category.create({
      name: 'Packaging & Supplies',
      description: 'Boxes, tapes, cushioning, containers'
    });

    const catTools = await Category.create({
      name: 'Tools & Hardware',
      description: 'Industrial fasteners, hand tools, maintenance'
    });

    // 5. Create Products
    console.log('Creating products...');
    const p1 = await Product.create({
      name: 'Titanium Rod 20mm',
      sku: 'TR-20MM',
      category: catRaw._id,
      unitOfMeasure: 'pcs',
      description: 'High tensile strength aerospace-grade titanium rod 20mm diameter',
      stockQuantity: 120,
      reorderThreshold: 30,
      stockPerLocation: [
        { location: locWh1A._id, warehouse: wh1._id, quantity: 80 },
        { location: locWh2A._id, warehouse: wh2._id, quantity: 40 }
      ],
      createdBy: manager._id
    });

    const p2 = await Product.create({
      name: 'Alloy Aluminum Plate',
      sku: 'AL-500',
      category: catRaw._id,
      unitOfMeasure: 'pcs',
      description: 'Pre-cut 500x500mm 5mm precision aluminum sheet plate',
      stockQuantity: 12, // Low stock! Threshold is 25
      reorderThreshold: 25,
      stockPerLocation: [
        { location: locWh1B._id, warehouse: wh1._id, quantity: 12 }
      ],
      createdBy: manager._id
    });

    const p3 = await Product.create({
      name: 'STM32 Microcontroller Core',
      sku: 'MCU-STM32',
      category: catElec._id,
      unitOfMeasure: 'pcs',
      description: 'High performance ARM Cortex-M4 microcontroller unit',
      stockQuantity: 0, // Out of stock!
      reorderThreshold: 50,
      stockPerLocation: [],
      createdBy: manager._id
    });

    const p4 = await Product.create({
      name: 'Heavy Duty Shipping Carton (Large)',
      sku: 'CTN-HD-LG',
      category: catPack._id,
      unitOfMeasure: 'boxes',
      description: 'Double walled 3-ply heavy corrugated shipping carton 60x40x40cm',
      stockQuantity: 450,
      reorderThreshold: 100,
      stockPerLocation: [
        { location: locWh1B._id, warehouse: wh1._id, quantity: 450 }
      ],
      createdBy: manager._id
    });

    const p5 = await Product.create({
      name: 'Precision Fasteners M6',
      sku: 'FST-M6-SS',
      category: catTools._id,
      unitOfMeasure: 'pcs',
      description: 'Stainless steel grade 316 hex bolt & locknut set',
      stockQuantity: 850,
      reorderThreshold: 200,
      stockPerLocation: [
        { location: locWh1A._id, warehouse: wh1._id, quantity: 850 }
      ],
      createdBy: manager._id
    });

    // 6. Create Initial Ledger Moves for stocked products
    console.log('Creating initial ledger moves...');
    await StockMove.create([
      {
        reference: 'INIT-BALANCE',
        operationType: 'adjustment',
        product: p1._id,
        productName: p1.name,
        productSku: p1.sku,
        toLocation: locWh1A._id,
        toWarehouse: wh1._id,
        quantity: 120,
        quantityBefore: 0,
        quantityAfter: 120,
        unitOfMeasure: p1.unitOfMeasure,
        performedBy: manager._id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        reference: 'INIT-BALANCE',
        operationType: 'adjustment',
        product: p2._id,
        productName: p2.name,
        productSku: p2.sku,
        toLocation: locWh1B._id,
        toWarehouse: wh1._id,
        quantity: 12,
        quantityBefore: 0,
        quantityAfter: 12,
        unitOfMeasure: p2.unitOfMeasure,
        performedBy: manager._id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        reference: 'INIT-BALANCE',
        operationType: 'adjustment',
        product: p4._id,
        productName: p4.name,
        productSku: p4.sku,
        toLocation: locWh1B._id,
        toWarehouse: wh1._id,
        quantity: 450,
        quantityBefore: 0,
        quantityAfter: 450,
        unitOfMeasure: p4.unitOfMeasure,
        performedBy: manager._id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]);

    // 7. Create Sample Receipt
    console.log('Creating sample receipt...');
    const receipt = await Receipt.create({
      reference: 'REC-2026-0001',
      supplier: 'Apex Metallurgy Corp',
      status: 'waiting',
      destinationWarehouse: wh1._id,
      destinationLocation: locWh1Dock._id,
      lines: [
        {
          product: p1._id,
          expectedQty: 50,
          receivedQty: 0,
          unitOfMeasure: 'pcs'
        },
        {
          product: p2._id,
          expectedQty: 30,
          receivedQty: 0,
          unitOfMeasure: 'pcs'
        }
      ],
      notes: 'Urgent material batch for Project Alpha fabrication',
      createdBy: manager._id
    });

    // 8. Create Sample Delivery Order
    console.log('Creating sample delivery order...');
    const delivery = await DeliveryOrder.create({
      reference: 'DEL-2026-0001',
      customer: 'Skyline Aerospace Ltd',
      status: 'ready',
      sourceWarehouse: wh1._id,
      sourceLocation: locWh1A._id,
      lines: [
        {
          product: p1._id,
          requestedQty: 10,
          deliveredQty: 0,
          unitOfMeasure: 'pcs'
        }
      ],
      notes: 'Ship via Priority Express freight',
      createdBy: manager._id
    });

    // 9. Create Sample Transfer
    console.log('Creating sample transfer...');
    await InternalTransfer.create({
      reference: 'INT-2026-0001',
      status: 'waiting',
      sourceWarehouse: wh1._id,
      sourceLocation: locWh1A._id,
      destinationWarehouse: wh2._id,
      destinationLocation: locWh2A._id,
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      lines: [
        {
          product: p1._id,
          quantity: 15,
          unitOfMeasure: 'pcs'
        }
      ],
      notes: 'Replenishing North Depot safety stock',
      createdBy: staff._id
    });

    console.log('\n=========================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Demo Credentials:');
    console.log('  Manager: manager@stocksense.com | password123');
    console.log('  Staff:   staff@stocksense.com   | password123');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
