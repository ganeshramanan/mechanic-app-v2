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
    description,
    cost,
    phone_number,
  } = req.body;

  if (!vehicle_number || !description || !cost) {
    return res.status(400).json({
      error: "vehicle_number, description and cost are required",
    });
  }

  try {
    const today = new Date();

    const service_date =
      today.toISOString().split("T")[0];

    const next = new Date();
    next.setMonth(today.getMonth() + 3);

    const next_service_date =
      next.toISOString().split("T")[0];

    const result = await pool.query(
      `
      INSERT INTO Service (
        vehicle_number,
        description,
        cost,
        service_date,
        next_service_date,
        phone_number
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id
      `,
      [
        vehicle_number,
        description,
        cost,
        service_date,
        next_service_date,
        phone_number || null,
      ]
    );

    res.json({
      message: "Service added successfully ✔",
      id: result.rows[0].id,
      next_service_date,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* ---------------- VEHICLE HISTORY ---------------- */

app.get("/vehicle/:number", async (req, res) => {
  try {
    const number = req.params.number;

    const result = await pool.query(
      `
      SELECT *
      FROM Service
      WHERE UPPER(vehicle_number)=UPPER($1)
      ORDER BY service_date DESC
      `,
      [number]
    );

    const rows = result.rows.map((row) => ({
      ...row,
      service_date: row.service_date
        ? row.service_date.toLocaleDateString("en-GB")
        : null,
      next_service_date: row.next_service_date
        ? row.next_service_date.toLocaleDateString("en-GB")
        : null,
    }));

    res.json(rows);
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
      SELECT *,
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

    const rows = result.rows.map((row) => ({
      ...row,
      service_date: row.service_date
        ? row.service_date.toLocaleDateString("en-GB")
        : null,
      next_service_date: row.next_service_date
        ? row.next_service_date.toLocaleDateString("en-GB")
        : null,
    }));

    res.json(rows);
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
    const result = await pool.query(
      `
      SELECT *
      FROM Service
      ORDER BY id DESC
      `
    );

    const rows = result.rows.map((row) => ({
      ...row,
      service_date: row.service_date
        ? row.service_date.toLocaleDateString("en-GB")
        : null,
      next_service_date: row.next_service_date
        ? row.next_service_date.toLocaleDateString("en-GB")
        : null,
    }));

    res.json(rows);
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

/* ---------------- START SERVER ---------------- */

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});


