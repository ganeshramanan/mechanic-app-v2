const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- HOME ---------------- */

app.get("/", (req, res) => {
  res.json({
    message: "Mechanic App V2 API Running 🚀",
  });
});

/* ---------------- HEALTH ---------------- */

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT NOW()");

    res.json({
      status: "ok",
      database: "postgresql",
    });
  } catch (err) {
    console.error("Health check error:", err);

    res.status(500).json({
      status: "error",
      error: err.message,
      code: err.code,
      detail: err.detail,
    });
  }
});

/* ---------------- ADD SERVICE ---------------- */

app.post("/service", async (req, res) => {
  const { customer_name, bike_model, vehicle_number, phone_number, items } =
    req.body;

  if (!customer_name || !phone_number || !vehicle_number || !bike_model) {
    return res.status(400).json({
      error:
        "customer_name, phone_number, vehicle_number and bike_model are required",
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: "At least one service item is required",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* 1. CUSTOMER */

    let customerResult = await client.query(
      `SELECT id
       FROM customers
       WHERE phone = $1
       LIMIT 1`,
      [phone_number],
    );

    let customer_id;

    if (customerResult.rows.length === 0) {
      const newCustomer = await client.query(
        `INSERT INTO customers (name, phone)
         VALUES ($1, $2)
         RETURNING id`,
        [customer_name, phone_number],
      );

      customer_id = newCustomer.rows[0].id;
    } else {
      customer_id = customerResult.rows[0].id;

      // Update customer name in case it changed
      await client.query(
        `UPDATE customers
         SET name = $1
         WHERE id = $2`,
        [customer_name, customer_id],
      );
    }

    /* 2. VEHICLE */

    let vehicleResult = await client.query(
      `SELECT id
       FROM vehicles
       WHERE UPPER(vehicle_number) = UPPER($1)
       LIMIT 1`,
      [vehicle_number],
    );

    let vehicle_id;

    if (vehicleResult.rows.length === 0) {
      const newVehicle = await client.query(
        `INSERT INTO vehicles
         (customer_id, vehicle_number, bike_model)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [customer_id, vehicle_number.toUpperCase(), bike_model],
      );

      vehicle_id = newVehicle.rows[0].id;
    } else {
      vehicle_id = vehicleResult.rows[0].id;

      await client.query(
        `UPDATE vehicles
         SET customer_id = $1,
             bike_model = $2
         WHERE id = $3`,
        [customer_id, bike_model, vehicle_id],
      );
    }

    /* 3. SERVICE DATES */

    const today = new Date();

    const service_date = today.toISOString().split("T")[0];

    const next = new Date(today);

    next.setMonth(today.getMonth() + 3);

    const next_service_date = next.toISOString().split("T")[0];

    /* 4. SERVICE */

    const serviceResult = await client.query(
      `INSERT INTO services
       (vehicle_id, service_date, next_service_date)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [vehicle_id, service_date, next_service_date],
    );

    const service_id = serviceResult.rows[0].id;

    /* 5. SERVICE ITEMS */

    for (const item of items) {
      if (!item.name || item.amount === undefined) {
        throw new Error("Each service item must have a name and amount");
      }

      await client.query(
        `INSERT INTO service_items
         (service_id, item_name, amount)
         VALUES ($1, $2, $3)`,
        [service_id, item.name.trim(), Number(item.amount)],
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Service saved successfully ✔",
      service_id,
      service_date,
      next_service_date,
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Add service error:", err);

    res.status(500).json({
      error: err.message,
    });
  } finally {
    client.release();
  }
});

/* ---------------- VEHICLE HISTORY ---------------- */

app.get("/vehicle/:number", async (req, res) => {
  try {
    const number = req.params.number;

    const result = await pool.query(
      `
      SELECT
        s.id,
        v.vehicle_number,
        v.bike_model,
        c.name AS customer_name,
        c.phone AS phone_number,
        TO_CHAR(s.service_date, 'DD/MM/YYYY') AS service_date,
        TO_CHAR(s.next_service_date, 'DD/MM/YYYY') AS next_service_date,
        COALESCE(
          json_agg(
            json_build_object(
              'name', si.item_name,
              'amount', si.amount
            )
          ) FILTER (WHERE si.id IS NOT NULL),
          '[]'
        ) AS items
      FROM services s
      JOIN vehicles v
        ON v.id = s.vehicle_id
      JOIN customers c
        ON c.id = v.customer_id
      LEFT JOIN service_items si
        ON si.service_id = s.id
      WHERE UPPER(v.vehicle_number) = UPPER($1)
      GROUP BY
        s.id,
        v.vehicle_number,
        v.bike_model,
        c.name,
        c.phone
      ORDER BY s.id DESC
      `,
      [number],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Vehicle history error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* ---------------- DUE SERVICES ---------------- */

app.get("/due-services", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        v.vehicle_number,
        v.bike_model,
        c.name AS customer_name,
        c.phone AS phone_number,
        TO_CHAR(s.service_date, 'DD/MM/YYYY') AS service_date,
        TO_CHAR(s.next_service_date, 'DD/MM/YYYY') AS next_service_date,
        CASE
          WHEN s.next_service_date < CURRENT_DATE
            THEN 'OVERDUE'
          WHEN s.next_service_date <= CURRENT_DATE + INTERVAL '7 days'
            THEN 'DUE_SOON'
          ELSE 'OK'
        END AS status
      FROM services s
      JOIN vehicles v
        ON s.vehicle_id = v.id
      JOIN customers c
        ON v.customer_id = c.id
      ORDER BY s.next_service_date ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Due services error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* ---------------- WHATSAPP REMINDERS ---------------- */

app.get("/whatsapp-reminders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        v.vehicle_number,
        v.bike_model,
        c.phone AS phone_number,
        s.next_service_date,
        CASE
          WHEN s.next_service_date < CURRENT_DATE
            THEN 'OVERDUE'
          WHEN s.next_service_date <= CURRENT_DATE + INTERVAL '7 days'
            THEN 'DUE_SOON'
        END AS status
      FROM services s
      JOIN vehicles v
        ON s.vehicle_id = v.id
      LEFT JOIN customers c
        ON v.customer_id = c.id
      WHERE s.next_service_date IS NOT NULL
        AND s.next_service_date <= CURRENT_DATE + INTERVAL '7 days'
      ORDER BY s.next_service_date ASC
    `);

    const reminders = result.rows
      .filter((row) => row.status === "OVERDUE" || row.status === "DUE_SOON")
      .map((row) => {
        const phone = String(row.phone_number || "").replace(/\D/g, "");

        const message = `🏍️ VT Motors Reminder

Vehicle: ${row.vehicle_number}
Bike: ${row.bike_model || "-"}
Due Date: ${row.next_service_date}

Please service your vehicle soon.`;

        return {
          id: row.id,
          vehicle_number: row.vehicle_number,
          bike_model: row.bike_model,
          phone_number: row.phone_number,
          next_service_date: row.next_service_date,
          status: row.status,
          whatsapp_url: phone
            ? `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`
            : null,
        };
      });

    res.json(reminders);
  } catch (err) {
    console.error("WhatsApp reminders error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* ---------------- BILL API ---------------- */

app.get("/bill/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const serviceResult = await pool.query(
      `
      SELECT
        s.id,
        c.name AS customer_name,
        c.phone AS phone_number,
        v.vehicle_number,
        v.bike_model,
        TO_CHAR(s.service_date, 'DD/MM/YYYY') AS service_date,
        TO_CHAR(s.next_service_date, 'DD/MM/YYYY') AS next_service_date
      FROM services s
      JOIN vehicles v
        ON v.id = s.vehicle_id
      JOIN customers c
        ON c.id = v.customer_id
      WHERE s.id = $1
      `,
      [id],
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({
        error: "Service not found",
      });
    }

    const service = serviceResult.rows[0];

    const itemsResult = await pool.query(
      `
      SELECT
        item_name AS name,
        amount
      FROM service_items
      WHERE service_id = $1
      ORDER BY id
      `,
      [id],
    );

    const items = itemsResult.rows;

    const total = items.reduce((sum, item) => sum + Number(item.amount), 0);

    res.json({
      ...service,
      items,
      total,
    });
  } catch (err) {
    console.error("Bill API error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* ---------------- PDF INVOICE ---------------- */

app.get("/bill/:id/pdf", async (req, res) => {
  try {
    const id = req.params.id;

    const serviceResult = await pool.query(
      `
      SELECT
        s.id,
        c.name AS customer_name,
        c.phone AS phone_number,
        v.vehicle_number,
        v.bike_model,
        TO_CHAR(s.service_date, 'DD/MM/YYYY') AS service_date
      FROM services s
      JOIN vehicles v
        ON v.id = s.vehicle_id
      JOIN customers c
        ON c.id = v.customer_id
      WHERE s.id = $1
      `,
      [id],
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).send("Bill not found");
    }

    const service = serviceResult.rows[0];

    const itemsResult = await pool.query(
      `
      SELECT item_name, amount
      FROM service_items
      WHERE service_id = $1
      ORDER BY id
      `,
      [id],
    );

    const items = itemsResult.rows;

    const total = items.reduce((sum, item) => sum + Number(item.amount), 0);

    const doc = new PDFDocument({
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader("Content-Disposition", `inline; filename=bill-${id}.pdf`);

    doc.pipe(res);

    doc.fontSize(20).text("VT Motors", {
      align: "center",
    });

    doc.fontSize(14).text("Bike Service Invoice", {
      align: "center",
    });

    doc.moveDown();

    doc
      .fontSize(11)
      .text(`Customer: ${service.customer_name}`)
      .text(`Phone: ${service.phone_number}`)
      .text(`Bike: ${service.bike_model || "-"}`)
      .text(`Vehicle: ${service.vehicle_number}`)
      .text(`Date: ${service.service_date}`);

    doc.moveDown();

    doc.fontSize(12).text("Service Items");

    doc.moveDown(0.5);

    items.forEach((item) => {
      doc.text(`${item.item_name} - ₹${Number(item.amount).toFixed(2)}`);
    });

    doc.moveDown();

    doc.fontSize(15).text(`TOTAL: ₹${total.toFixed(2)}`, {
      align: "right",
    });

    doc.end();
  } catch (err) {
    console.error("PDF error:", err);

    res.status(500).send(err.message);
  }
});
/* ---------------- RECENT SERVICES ---------------- */

app.get("/recent-services", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        v.vehicle_number,
        v.bike_model,
        c.name AS customer_name,
        TO_CHAR(s.service_date, 'DD/MM/YYYY') AS service_date,
        COALESCE(
          SUM(si.amount),
          0
        ) AS total_amount
      FROM services s
      JOIN vehicles v
        ON s.vehicle_id = v.id
      JOIN customers c
        ON v.customer_id = c.id
      LEFT JOIN service_items si
        ON si.service_id = s.id
      GROUP BY
        s.id,
        v.vehicle_number,
        v.bike_model,
        c.name,
        s.service_date
      ORDER BY s.service_date DESC, s.id DESC
      LIMIT 5
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Recent services error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* ---------------- DASHBOARD STATS ---------------- */

app.get("/dashboard-stats", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM vehicles
        ) AS total_vehicles,

        (
          SELECT COUNT(*)
          FROM services
          WHERE service_date = CURRENT_DATE
        ) AS services_today,

        (
          SELECT COUNT(*)
          FROM services
          WHERE next_service_date >= CURRENT_DATE
            AND next_service_date <= CURRENT_DATE + INTERVAL '7 days'
        ) AS due_soon,

        (
          SELECT COALESCE(SUM(si.amount), 0)
          FROM service_items si
          JOIN services s
            ON s.id = si.service_id
          WHERE DATE_TRUNC('month', s.service_date)
                = DATE_TRUNC('month', CURRENT_DATE)
        ) AS revenue;

    `);

    const stats = result.rows[0];

    res.json({
      total_vehicles: Number(stats.total_vehicles),
      services_today: Number(stats.services_today),
      due_soon: Number(stats.due_soon),
      revenue: Number(stats.revenue),
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* ---------------- CUSTOMERS ---------------- */

app.get("/customers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.phone,
        COUNT(DISTINCT v.id) AS vehicle_count,
        COUNT(DISTINCT s.id) AS service_count
      FROM customers c
      LEFT JOIN vehicles v
        ON v.customer_id = c.id
      LEFT JOIN services s
        ON s.vehicle_id = v.id
      GROUP BY c.id, c.name, c.phone
      ORDER BY c.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Customers error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});





/* ---------------- 404 ---------------- */

app.use((req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.originalUrl,
  });
});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
