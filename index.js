const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- HOME ---------------- */

app.get("/", (req, res) => {
  res.send("Mechanic App V2 PostgreSQL Running 🚀");
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
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
});

/* ---------------- ADD SERVICE ---------------- */

app.post("/service", async (req, res) => {
  const {
    customer_name,
    bike_model,
    vehicle_number,
    phone_number,
    items
  } = req.body;


  try {


    // 1. CUSTOMER
    let customer = await pool.query(
      `SELECT id FROM Customers WHERE phone = $1`,
      [phone_number]
    );


    let customer_id;


    if (customer.rows.length === 0) {
      const newCustomer = await pool.query(
        `INSERT INTO Customers(name, phone)
         VALUES ($1,$2)
         RETURNING id`,
        [customer_name, phone_number]
      );
      customer_id = newCustomer.rows[0].id;
    } else {
      customer_id = customer.rows[0].id;
    }


    // 2. VEHICLE
    let vehicle = await pool.query(
      `SELECT id FROM Vehicles WHERE vehicle_number = $1`,
      [vehicle_number]
    );


    let vehicle_id;


    if (vehicle.rows.length === 0) {
      const newVehicle = await pool.query(
        `INSERT INTO Vehicles(customer_id, vehicle_number, bike_model)
         VALUES ($1,$2,$3)
         RETURNING id`,
        [customer_id, vehicle_number, bike_model]
      );
      vehicle_id = newVehicle.rows[0].id;
    } else {
      vehicle_id = vehicle.rows[0].id;
    }


    // 3. SERVICE DATES
    const today = new Date();
    const service_date = today.toISOString().split("T")[0];


    const next = new Date();
    next.setMonth(today.getMonth() + 3);
    const next_service_date = next.toISOString().split("T")[0];


    const serviceResult = await pool.query(
      `INSERT INTO Services(vehicle_id, service_date, next_service_date)
       VALUES ($1,$2,$3)
       RETURNING id`,
      [vehicle_id, service_date, next_service_date]
    );


    const service_id = serviceResult.rows[0].id;


    // 4. ITEMS
    for (let item of items) {
      await pool.query(
        `INSERT INTO Service_Items(service_id, item_name, amount)
         VALUES ($1,$2,$3)`,
        [service_id, item.name, item.amount]
      );
    }


    res.json({
      message: "Service saved successfully ✔",
      service_id
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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
        json_agg(
          json_build_object(
            'name', si.item_name,
            'amount', si.amount
          )
        ) AS items
      FROM Services s
      JOIN Vehicles v ON v.id = s.vehicle_id
      JOIN Customers c ON c.id = v.customer_id
      LEFT JOIN Service_Items si ON si.service_id = s.id
      WHERE UPPER(v.vehicle_number) = UPPER($1)
      GROUP BY s.id, v.vehicle_number, v.bike_model, c.name, c.phone
      ORDER BY s.id DESC
      `,
      [number]
    );


    res.json(result.rows);


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});







/* ---------------- DUE SERVICES ---------------- */

app.get("/due-services", async (req, res) => {
  try {
    const today = new Date();
    const next7 = new Date();
    next7.setDate(today.getDate() + 7);

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

        CASE
          WHEN s.next_service_date < CURRENT_DATE THEN 'OVERDUE'
          WHEN s.next_service_date <= $1::date THEN 'DUE_SOON'
          ELSE 'OK'
        END AS status

      FROM services s
      JOIN vehicles v ON s.vehicle_id = v.id
      JOIN customers c ON v.customer_id = c.id
      ORDER BY s.next_service_date ASC
      `,
      [next7.toISOString().split("T")[0]]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});




/* ---------------- DEBUG DB ---------------- */

app.get("/debug-db", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        vehicle_number,
        description,
        cost,
        phone_number,
        TO_CHAR(service_date, 'DD/MM/YYYY') AS service_date,
        TO_CHAR(next_service_date, 'DD/MM/YYYY') AS next_service_date
      FROM Service
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* ---------------- RESET DB ---------------- */

app.get("/reset-db", async (req, res) => {
  try {
    await pool.query(
      "TRUNCATE TABLE Service RESTART IDENTITY"
    );

    res.json({
      message: "Database reset successful ✔",
    });
  } catch (err) {
    console.error(err);

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
        c.phone AS phone_number,
        v.bike_model,
        s.next_service_date,

        CASE
          WHEN s.next_service_date < CURRENT_DATE THEN 'OVERDUE'
          WHEN s.next_service_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'DUE_SOON'
          ELSE 'OK'
        END AS status

      FROM services s
      JOIN vehicles v ON s.vehicle_id = v.id
      JOIN customers c ON s.customer_id = c.id

      WHERE c.phone IS NOT NULL
        AND TRIM(c.phone) <> ''
      ORDER BY s.next_service_date ASC
    `);

    const reminders = result.rows.map((row) => {
      const message =
`🏍️ VT Motors Reminder

Vehicle: ${row.vehicle_number}
Bike: ${row.bike_model || "-"}
Due Date: ${row.next_service_date}

Please service your vehicle soon.
Thank you`;

      return {
        id: row.id,
        vehicle_number: row.vehicle_number,
        phone_number: row.phone_number,
        next_service_date: row.next_service_date,
        status: row.status,
        whatsapp_url: `https://wa.me/91${row.phone_number}?text=${encodeURIComponent(message)}`
      };
    });

    res.json(reminders);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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
      JOIN vehicles v ON s.vehicle_id = v.id
      JOIN customers c ON v.customer_id = c.id
      WHERE s.id = $1
      `,
      [id]
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
      `,
      [id]
    );

    const items = itemsResult.rows;

    const total = items.reduce((sum, i) => sum + Number(i.amount), 0);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=bill-${id}.pdf`);

    doc.pipe(res);

    doc.fontSize(18).text("Bike Service Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12)
      .text(`Customer: ${service.customer_name}`)
      .text(`Bike: ${service.bike_model}`)
      .text(`Vehicle: ${service.vehicle_number}`)
      .text(`Date: ${service.service_date}`);

    doc.moveDown();

    items.forEach(i => {
      doc.text(`${i.item_name} - ${i.amount}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`TOTAL: ${total}`, { align: "right" });

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});





/* ---------------- BILL API ---------------- */

app.get("/bill/:id", async (req, res) => {
  const id = req.params.id;

  try {
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
      JOIN vehicles v ON s.vehicle_id = v.id
      JOIN customers c ON v.customer_id = c.id
      WHERE s.id = $1
      `,
      [id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    const service = serviceResult.rows[0];

    const itemsResult = await pool.query(
      `
      SELECT item_name AS name, amount
      FROM service_items
      WHERE service_id = $1
      `,
      [id]
    );

    const items = itemsResult.rows;

    const total = items.reduce(
      (sum, i) => sum + Number(i.amount),
      0
    );

    res.json({
      ...service,
      items,
      total,
    });

  } catch (err) {
    console.error("Bill API error:", err);
    res.status(500).json({ error: err.message });
  }
});








/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

