const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Middleware para manejar todas las solicitudes y reenviarlas
app.all("*", async (req, res) => {
  const url = "http://servidor.ieshlanz.es:8000/crud" + req.url;
  
  const options = {
    method: req.method,
    headers: {
      "Content-Type": req.headers["content-type"] || "application/json",
    },
  };

  // Solo incluir el body si la petición no es GET o DELETE
  if (req.method !== "GET" && req.method !== "DELETE") {
    options.body = JSON.stringify(req.body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.text();

    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });

    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: "Error en el proxy", details: error.message });
  }
});

// Exportar para Vercel
module.exports = app;
