/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { createProduct } from '../services/product.service';
import { CreateProductInput } from '../schemas/product.schema';
import db from '../db';
import { initDb } from '../db';

async function seedData() {
    console.log('Seeding initial data...');

    try {
        initDb();

        // 1. Seed Categories
        const categories = [
            { name: 'البان', description: 'Milk, cheese, yogurt' },
            { name: 'معجنات', description: 'Bread, pastries' },
            { name: 'خضروات', description: 'Fresh fruits and vegetables' },
            { name: 'سريعة', description: 'Chips, cookies, candy' }
        ];

        console.log('Inserting categories...');
        for (const cat of categories) {
            try {
                db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(cat.name, cat.description);
            } catch (e: any) {
                if (!e.message.includes('UNIQUE constraint failed')) {
                    throw e;
                }
            }
        }

        // Get category IDs for mapping
        const categoryMap: Record<string, number> = {};
        const dbCategories = db.prepare('SELECT id, name FROM categories').all() as any[];
        dbCategories.forEach(c => {
            categoryMap[c.name] = c.id;
        });

        const catIds = dbCategories.map(c => c.id);
        if (catIds.length === 0) {
            throw new Error('No categories found in database');
        }

        // 2. Seed Products
        const products = [
            {
                "sku": "ha-34",
                "barcode": "76600555444",
                "name": "عسل",
                "description": "",
                "category_id": "1",
                "cost_price": "980",
                "selling_price": "1000",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "8"
            },
            {
                "sku": "uw-87",
                "barcode": "78832554444",
                "name": "جام",
                "description": "",
                "category_id": "2",
                "cost_price": "650",
                "selling_price": "670",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "5"
            },
            {
                "sku": "ha-11",
                "barcode": "65002223333",
                "name": "جبنة",
                "description": "",
                "category_id": "3",
                "cost_price": "750",
                "selling_price": "770",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "8"
            },
            {
                "sku": "uy-876",
                "barcode": "78812340000",
                "name": "روتي",
                "description": "",
                "category_id": "0",
                "cost_price": "25",
                "selling_price": "45",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "43"
            },
            {
                "sku": "op-098",
                "barcode": "98763411114",
                "name": "عصير تفاح",
                "description": "",
                "category_id": "1",
                "cost_price": "100",
                "selling_price": "120",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "23"
            },
            {
                "sku": "td-123",
                "barcode": "766554444445",
                "name": "عصير برتقال",
                "description": "",
                "category_id": "2",
                "cost_price": "100",
                "selling_price": "120",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "33"
            },
            {
                "sku": "ff-234",
                "barcode": "1098888887777",
                "name": "عصير عنب",
                "description": "",
                "category_id": "3",
                "cost_price": "100",
                "selling_price": "120",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "21"
            },
            {
                "sku": "o-09",
                "barcode": "781111112233",
                "name": "خبز ابيض",
                "description": "",
                "category_id": "0",
                "cost_price": "20",
                "selling_price": "40",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "15"
            },
            {
                "sku": "kj-233",
                "barcode": "4355566666778",
                "name": "خبز اسمر",
                "description": "",
                "category_id": "1",
                "cost_price": "20",
                "selling_price": "40",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "15"
            },
            {
                "sku": "mj-987",
                "barcode": "9776666655544",
                "name": "تونة",
                "description": "",
                "category_id": "2",
                "cost_price": "600",
                "selling_price": "620",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "12"
            },
            {
                "sku": "ui-65",
                "barcode": "111222333444555666777888999",
                "name": "شبس",
                "description": "",
                "category_id": "3",
                "cost_price": "40",
                "selling_price": "60",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "45"
            },
            {
                "sku": "sp-987",
                "barcode": "111244555666777888999",
                "name": "شكلاتة",
                "description": "",
                "category_id": "0",
                "cost_price": "100",
                "selling_price": "120",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "27"
            },
            {
                "sku": "po-789",
                "barcode": "11124455566677788823",
                "name": "صابون",
                "description": "",
                "category_id": "1",
                "cost_price": "130",
                "selling_price": "150",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "8"
            },
            {
                "sku": "tr-282",
                "barcode": "8833446666689",
                "name": "صابون يد",
                "description": "",
                "category_id": "2",
                "cost_price": "180",
                "selling_price": "200",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "9"
            },
            {
                "sku": "iu-338",
                "barcode": "9000123213233",
                "name": "كلوركس",
                "description": "",
                "category_id": "3",
                "cost_price": "560",
                "selling_price": "580",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "6"
            },
            {
                "sku": "ll-098",
                "barcode": "5466888889999",
                "name": "فلاش",
                "description": "",
                "category_id": "0",
                "cost_price": "800",
                "selling_price": "820",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "9"
            },
            {
                "sku": "sa-78",
                "barcode": "546688888999944",
                "name": "سفنج",
                "description": "",
                "category_id": "1",
                "cost_price": "70",
                "selling_price": "90",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "21"
            },
            {
                "sku": "fd-098",
                "barcode": "5466888889999441122",
                "name": "ولاعة",
                "description": "",
                "category_id": "2",
                "cost_price": "80",
                "selling_price": "100",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "32"
            },
            {
                "sku": "tw-098",
                "barcode": "5466888889999441887543",
                "name": "بسكويت",
                "description": "",
                "category_id": "3",
                "cost_price": "80",
                "selling_price": "100",
                "tax_rate": "0",
                "is_perishable": "0",
                "is_weighed": "0",
                "quantity": "28"
            }
        ];

        console.log('Inserting products...');

        // Get the admin user to attribute products to
        const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get() as { id: string };
        if (!admin) {
            console.error('❌ No admin user found. Please run create-admin script first.');
            process.exit(1);
        }

        for (const prod of products) {
            try {
                // Map the category_id from the seed data to a valid ID from our inserted categories
                // If the user's ID is "0", "1", "2", "3", map them to catIds[0], catIds[1], etc.
                let targetCategoryIndex = parseInt(prod.category_id);
                if (isNaN(targetCategoryIndex) || targetCategoryIndex < 0 || targetCategoryIndex >= catIds.length) {
                    targetCategoryIndex = 0; // Default to first category if invalid
                }
                const validCategoryId = catIds[targetCategoryIndex];

                const productInput: CreateProductInput = {
                    sku: prod.sku,
                    barcode: prod.barcode || undefined,
                    name: prod.name,
                    description: prod.description || undefined,
                    category_id: validCategoryId,
                    cost_price: parseFloat(prod.cost_price),
                    selling_price: parseFloat(prod.selling_price),
                    tax_rate: parseFloat(prod.tax_rate || '0'),
                    is_perishable: prod.is_perishable === '1',
                    is_weighed: prod.is_weighed === '1',
                    initial_quantity: parseFloat(prod.quantity || '0'),
                    reorder_level: 10
                };

                createProduct(productInput, admin.id);

            } catch (e: any) {
                if (e.message.includes('UNIQUE constraint failed')) {
                    console.log(`Product ${prod.name} already exists, skipping.`);
                    // Optional: If product exists but you want to update stock, logic goes here
                } else {
                    throw e;
                }
            }
        }

        // FIX 2: REMOVED the global overwrite
        // The line below was deleted because it was setting ALL items to 50
        // db.prepare('UPDATE stock_levels SET quantity = 50').run();

        console.log('✅ Seeding completed successfully!');
        process.exit(0);
    } catch (err: any) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
}

seedData();