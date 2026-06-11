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
    vehicle_number,
    phone_number,
    items
  } = req.body;

  if (!vehicle_number || !items || items.length === 0) {
    return res.status(400).json({
      error: "vehicle_number and items are required"
    });
  }

  try {
    const today = new Date();

    const service_date = today.toISOString().split("T")[0];

    const next = new Date();
    next.setMonth(today.getMonth() + 3);

    const next_service_date = next.toISOString().split("T")[0];

    // 1. INSERT SERVICE
    const serviceResult = await pool.query(
      `
      INSERT INTO Service (
        vehicle_number,
        service_date,
        next_service_date,
        phone_number
      )
      VALUES ($1,$2,$3,$4)
      RETURNING id
      `,
      [
        vehicle_number,
        service_date,
        next_service_date,
        phone_number || null
      ]
    );

    const service_id = serviceResult.rows[0].id;

    // 2. INSERT ITEMS
    for (let item of items) {

      await pool.query(
        `
        INSERT INTO ServiceItems (
          service_id,
          item_name,
          amount
        )
        VALUES ($1,$2,$3)
        `,
        [
          service_id,
          item.name,
          item.amount
        ]
      );
    }

    res.json({
      message: "Service + Items saved successfully ✔",
      service_id,
      next_service_date
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});



/* ---------------- VEHICLE HISTORY ---------------- */

app.get("/vehicle/:number", async (req, res) => {
  try {
    const number = req.params.number;

    const result = await pool.query(
      `
      SELECT
        id,
        vehicle_number,
        description,
        cost,
        phone_number,
        TO_CHAR(service_date, 'DD/MM/YYYY') AS service_date,
        TO_CHAR(next_service_date, 'DD/MM/YYYY') AS next_service_date
      FROM Service
      WHERE UPPER(vehicle_number)=UPPER($1)
      ORDER BY service_date DESC
      `,
      [number]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* ---------------- DUE SERVICES ---------------- */

app.get("/due-services", async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const next7Str =
      next7Days.toISOString().split("T")[0];

    const result = await pool.query(
      `
      SELECT
        id,
        vehicle_number,
        description,
        cost,
        phone_number,
        TO_CHAR(service_date, 'DD/MM/YYYY') AS service_date,
        TO_CHAR(next_service_date, 'DD/MM/YYYY') AS next_service_date,

        CASE
          WHEN next_service_date < $1::date
            THEN 'OVERDUE'
          WHEN next_service_date <= $2::date
            THEN 'DUE_SOON'
          ELSE 'OK'
        END AS status

      FROM Service
      ORDER BY next_service_date ASC
      `,
      [todayStr, next7Str]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
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

    const today = new Date();

    const todayStr =
      today.toISOString().split("T")[0];

    const next7Days = new Date();

    next7Days.setDate(
      today.getDate() + 7
    );

    const next7Str =
      next7Days.toISOString().split("T")[0];

    const result = await pool.query(
      `
      SELECT
        id,
        vehicle_number,
        phone_number,

        next_service_date,

        TO_CHAR(
          next_service_date,
          'DD/MM/YYYY'
        ) AS next_service_date_formatted

      FROM Service

      WHERE phone_number IS NOT NULL
        AND TRIM(phone_number) <> ''
        AND next_service_date <= $1::date

      ORDER BY next_service_date ASC
      `,
      [next7Str]
    );

    const reminders = result.rows.map((row) => {

      let status = "OK";

      if (
        row.next_service_date
          .toISOString()
          .split("T")[0] < todayStr
      ) {
        status = "OVERDUE";
      }
      else {
        status = "DUE_SOON";
      }

      const message =
`Dear Customer,

Your vehicle ${row.vehicle_number} is due for service on ${row.next_service_date_formatted}.

Please contact us to schedule your next service.

Thanks,
VT Motors`;

      return {

        id: row.id,

        vehicle_number:
          row.vehicle_number,

        phone_number:
          row.phone_number,

        next_service_date:
          row.next_service_date_formatted,

        status,

        whatsapp_url:
          `https://wa.me/91${row.phone_number}?text=${encodeURIComponent(message)}`
      };
    });

    res.json(reminders);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

const PDFDocument = require("pdfkit");

/* ---------------- PDF INVOICE ---------------- */

app.get("/bill/:id/pdf", async (req, res) => {

  try {

    const id = req.params.id;

    // 1. Get service
    const serviceResult = await pool.query(
      `
      SELECT
        id,
        vehicle_number,
        phone_number,
        TO_CHAR(service_date, 'DD/MM/YYYY') AS service_date
      FROM Service
      WHERE id = $1
      `,
      [id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).send("Bill not found");
    }

    const service = serviceResult.rows[0];

    // 2. Get items
    const itemsResult = await pool.query(
      `
      SELECT item_name, amount
      FROM ServiceItems
      WHERE service_id = $1
      `,
      [id]
    );

    const items = itemsResult.rows;

    const total = items.reduce(
      (sum, i) => sum + Number(i.amount),
      0
    );

    // 3. Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=bill-${id}.pdf`
    );

    doc.pipe(res);

    // =========================
    // HEADER
    // =========================
    doc
      .fontSize(20)
      .text("🏍️ Bike Service Invoice", { align: "center" });

    doc.moveDown();

    doc
      .fontSize(12)
      .text("Workshop: VT Motors")
      .text(`Invoice No: ${service.id}`)
      .text(`Date: ${service.service_date}`)
      .text(`Vehicle: ${service.vehicle_number}`)
      .text(`Phone: ${service.phone_number || "-"}`);

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();

    // =========================
    // TABLE HEADER
    // =========================
    doc
      .fontSize(12)
      .text("Item", 50, doc.y)
      .text("Amount", 400, doc.y);

    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();

    // =========================
    // ITEMS
    // =========================
    items.forEach((item) => {

      doc
        .text(item.item_name, 50)
        .text(`₹ ${item.amount}`, 400);

      doc.moveDown();
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();

    // =========================
    // TOTAL
    // =========================
    doc
      .fontSize(14)
      .text(`TOTAL: ₹ ${total}`, {
        align: "right"
      });

    doc.moveDown();

    // =========================
    // FOOTER
    // =========================
    doc
      .fontSize(10)
      .text(
        "Thank you for visiting VT Motors 🚀",
        { align: "center" }
      );

    doc.end();

  } catch (err) {

    console.error(err);

    res.status(500).send(err.message);
  }
});



/* ---------------- BILL API ---------------- */

app.get("/bill/:id", async (req, res) => {

  try {

    const id = req.params.id;

    // 1. Get service details
    const serviceResult = await pool.query(
      `
      SELECT
        id,
        vehicle_number,
        phone_number,
        TO_CHAR(service_date, 'DD/MM/YYYY') AS service_date
      FROM Service
      WHERE id = $1
      `,
      [id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({
        error: "Service not found"
      });
    }

    const service = serviceResult.rows[0];

    // 2. Get service items
    const itemsResult = await pool.query(
      `
      SELECT
        item_name,
        amount
      FROM ServiceItems
      WHERE service_id = $1
      `,
      [id]
    );

    const items = itemsResult.rows.map(item => ({
      name: item.item_name,
      amount: Number(item.amount)
    }));

    // 3. Calculate total
    const total = items.reduce(
      (sum, i) => sum + i.amount,
      0
    );

    // 4. Return bill structure
    res.json({
      service_id: service.id,
      vehicle_number: service.vehicle_number,
      phone_number: service.phone_number,
      service_date: service.service_date,
      items,
      total
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});












/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

