const { parse }   = require('csv-parse/sync');
const { getPool } = require('../config/db');
const Log = require('../models/Log');

async function getAll(req, res) {
  try {
    const db     = getPool();
    const [rows] = await db.query(`
      SELECT
        v.id_Vehicles AS id,
        v.plate,
        v.brand,
        v.color,
        v.vehicle_status,
        v.mileage,
        p_sell.name AS seller,
        p_sell.phone AS seller_phone,
        p.purchase_price,
        p.entry_date,
        p_buy.name AS buyer,
        p_buy.phone AS buyer_phone,
        s.sale_price,
        s.sale_date,
        IF(s.id_Sales IS NOT NULL, s.sale_price - p.purchase_price, NULL) AS profit,
        IF(s.id_Sales IS NOT NULL, 'Sold', 'Available') AS operation_status
      FROM vehicles  v
      LEFT JOIN  purchases p ON p.vehicle_id  = v.id_Vehicles
      LEFT JOIN  persons p_sell ON p_sell.id_Persons = p.seller_id
      LEFT JOIN  sales s ON s.vehicle_id  = v.id_Vehicles
      LEFT JOIN  persons p_buy  ON p_buy.id_Persons  = s.buyer_id
      ORDER BY v.id_Vehicles DESC
    `);

    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

async function getOne(req, res) {
  try {
    const db = getPool();
    const [rows] = await db.query(
      'SELECT * FROM vehicles WHERE id_Vehicles = ?',
      [req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ ok: false, error: 'Vehicle not found' });

    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

async function create(req, res) {
  const { plate, brand, color, vehicle_status, mileage } = req.body;

  if (!plate || !brand)
    return res.status(400).json({ ok: false, error: 'Plate and brand are required' });

  try {
    const db = getPool();
    const [result] = await db.query(
      'INSERT INTO vehicles (plate, brand, color, vehicle_status, mileage) VALUES (?,?,?,?,?)',
      [plate.toUpperCase(), brand, color, vehicle_status, mileage || 0]
    );

    await Log.saveLog('CREATE', {
      plate:      plate.toUpperCase(),
      vehicle_id: result.insertId,
      detail:     { plate, brand, color, vehicle_status, mileage },
    });

    res.status(201).json({ ok: true, id: result.insertId, message: 'Vehicle created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ ok: false, error: 'Plate already exists' });
    res.status(500).json({ ok: false, error: err.message });
  }
}

async function update(req, res) {
  const { brand, color, vehicle_status, mileage } = req.body;

  try {
    const db = getPool();
    const [[before]] = await db.query(
      'SELECT * FROM vehicles WHERE id_Vehicles = ?',
      [req.params.id]
    );

    if (!before)
      return res.status(404).json({ ok: false, error: 'Vehicle not found' });

    await db.query(
      'UPDATE vehicles SET brand=?, color=?, vehicle_status=?, mileage=? WHERE id_Vehicles=?',
      [brand, color, vehicle_status, mileage, req.params.id]
    );

    await Log.saveLog('EDIT', {
      plate: before.plate,
      vehicle_id: parseInt(req.params.id),
      detail: {
        before: { brand: before.brand, color: before.color, vehicle_status: before.vehicle_status, mileage: before.mileage },
        after:  { brand, color, vehicle_status, mileage },
      },
    });

    res.json({ ok: true, message: 'Vehicle updated' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

async function remove(req, res) {
  try {
    const db = getPool();
    const [purchases] = await db.query(
      'SELECT id_Purchase FROM purchases WHERE vehicle_id = ?',
      [req.params.id]
    );

    if (purchases.length > 0)
      return res.status(400).json({ ok: false, error: 'Cannot delete: vehicle has active transactions' });

    const [[vehicle]] = await db.query(
      'SELECT * FROM vehicles WHERE id_Vehicles = ?',
      [req.params.id]
    );

    if (!vehicle)
      return res.status(404).json({ ok: false, error: 'Vehicle not found' });

    await db.query('DELETE FROM vehicles WHERE id_Vehicles = ?', [req.params.id]);

    await Log.saveLog('DELETE', {
      plate:      vehicle.plate,
      vehicle_id: parseInt(req.params.id),
      detail:     vehicle,
    });

    res.json({ ok: true, message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

async function importCSV(req, res) {
  if (!req.file)
    return res.status(400).json({ ok: false, error: 'No file received' });

  try {
    const db = getPool();
    const records = parse(req.file.buffer.toString('utf8'), {
      columns: true, skip_empty_lines: true, trim: true
    });

    let inserted = 0, duplicates = 0, errors = 0;

    for (const row of records) {
      try {
        const [veh] = await db.query(
          'INSERT IGNORE INTO vehicles (plate, brand, color, vehicle_status, mileage) VALUES (?,?,?,?,?)',
          [row.placa, row.marca, row.color, row.estado_vehiculo, parseInt(row.kilometraje) || 0]
        );
        const [[vehicle]] = await db.query(
          'SELECT id_Vehicles FROM vehicles WHERE plate = ?', [row.placa]
        );
        if (!vehicle) { errors++; continue; }

        await db.query(
          'INSERT IGNORE INTO persons (name, phone) VALUES (?,?)',
          [row.nombre_vendedor, row.telefono_vendedor]
        );
        const [[seller]] = await db.query(
          'SELECT id_Persons FROM persons WHERE phone = ?', [row.telefono_vendedor]
        );

        const [[purchaseExists]] = await db.query(
          'SELECT id_Purchase FROM purchases WHERE vehicle_id = ?', [vehicle.id_Vehicles]
        );
        if (!purchaseExists && row.precio_compra) {
          await db.query(
            'INSERT INTO purchases (vehicle_id, seller_id, purchase_price, entry_date) VALUES (?,?,?,?)',
            [vehicle.id_Vehicles, seller.id_Persons, parseFloat(row.precio_compra), row.fecha_ingreso]
          );
        }

        if (row.nombre_comprador && row.precio_venta && row.estado_operacion === 'Vendido') {
          await db.query(
            'INSERT IGNORE INTO persons (name, phone) VALUES (?,?)',
            [row.nombre_comprador, row.telefono_comprador]
          );
          const [[buyer]] = await db.query(
            'SELECT id_Persons FROM persons WHERE phone = ?', [row.telefono_comprador]
          );
          const [[saleExists]] = await db.query(
            'SELECT id_Sales FROM sales WHERE vehicle_id = ?', [vehicle.id_Vehicles]
          );
          if (!saleExists) {
            await db.query(
              'INSERT IGNORE INTO sales (vehicle_id, buyer_id, sale_price, sale_date) VALUES (?,?,?,?)',
              [vehicle.id_Vehicles, buyer.id_Persons, parseFloat(row.precio_venta), row.fecha_venta]
            );
          }
        }

        veh.affectedRows > 0 ? inserted++ : duplicates++;
      } catch (_) { errors++; }
    }

    await Log.saveLog('IMPORT', {
      detail: { file: req.file.originalname, total: records.length, inserted, duplicates, errors },
    });

    res.json({
      ok: true,
      message: `CSV processed: ${inserted} new, ${duplicates} duplicates, ${errors} errors`,
      total:   records.length,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Error processing CSV: ' + err.message });
  }
}

module.exports = { getAll, getOne, create, update, remove, importCSV };