const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

// Middleware para analizar el cuerpo de las solicitudes JSON
app.use(express.json());

// Middleware CORS para habilitar CORS de cualquier origen
app.use(cors());

// Middleware para manejar las solicitudes OPTIONS (preflight)
app.options("*", (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": "*",  // Permitir acceso desde cualquier origen
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",  // Métodos permitidos
    "Access-Control-Allow-Headers": "Content-Type, Authorization",  // Encabezados permitidos
  });
  res.status(200).end();
});

// Middleware para manejar todas las solicitudes y reenviarlas al servidor de destino
app.all("*", async (req, res) => {
  const url = "http://servidor.ieshlanz.es:8000/crud" + req.url;

  const options = {
    method: req.method,
    headers: {
      "Content-Type": req.headers["content-type"] || "application/json",
    },
  };

  // Solo incluir el body si la petición no es GET o DELETE
  if (req.method !== "GET") {
    options.body = JSON.stringify(req.body);  // Asegurarse de enviar los datos correctamente como JSON
  }

  try {
    const response = await fetch(url, options);
    
    // Verificar el tipo de contenido de la respuesta
    let data;
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Responder con los encabezados CORS adecuados
    res.set({
      "Access-Control-Allow-Origin": "*",  // Permitir acceso desde cualquier origen
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",  // Métodos permitidos
      "Access-Control-Allow-Headers": "Content-Type, Authorization",  // Encabezados permitidos
    });

    res.status(response.status).send(data);
  } catch (error) {
    console.error("Error en el proxy:", error);
    res.status(500).json({ error: "Error en el proxy", details: error.message });
  }
});

// Exportar para Vercel
module.exports = app;
