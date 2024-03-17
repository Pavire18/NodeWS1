const express = require("express");
const fs = require("fs");

const PORT = 3000;
const server = express();
const router = express.Router();

// Configuración del server
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
const dataDirectory = "./data/";

router.get("/", (req, res) => {
  fs.readFile("./templates/index.html", "utf-8", (error, data) => {
    if (error) {
      res.status(500).send("Error inesperado");
    } else {
      res.set("Content-Type", "text/html");
      res.send(data);
    }
  });
});

router.get("/oscars", (req, res) => {
  fs.readdir(dataDirectory, (error, data) => {
    if (error) {
      res.status(500).send("Error inesperado");
    } else {
      console.log(data);
      const years = data.map((name) => name.replace("oscars-", "").replace(".json", ""));
      res.json({ years });
    }
  });
});

router.get("/oscars/:year", (req, res) => {
  const year = parseInt(req.params.year);
  const dataUrl = `${dataDirectory}oscars-${year}.json`;
  fs.readFile(dataUrl, (error, data) => {
    if (error) {
      res.status(500).send("Error inesperado");
    } else {
      const awards = JSON.parse(data);
      res.json(awards);
    }
  });
});

server.post("/oscars/:year", (req, res) => {
  const year = parseInt(req.params.year);
  const dataUrl = `${dataDirectory}oscars-${year}.json`;
  fs.readFile(dataUrl, (error, data) => {
    let awards = [];
    if (!error) {
      try {
        awards = JSON.parse(data);
      } catch (error) {
        res.status(500).send("Error inesperado read");
      }
    }

    const newAward = req.body;
    awards.push(newAward);
    console.log(awards);
    fs.writeFile(dataUrl, JSON.stringify(awards), (error) => {
      if (error) {
        res.status(500).send("Error inesperado write");
      } else {
        res.json(newAward);
      }
    });
  });
});

router.get("/winners-multiple/:year", (req, res) => {
  const year = parseInt(req.params.year);
  const dataUrl = `${dataDirectory}oscars-${year}.json`;
  fs.readFile(dataUrl, (error, data) => {
    if (error) {
      res.status(500).send("Error inesperado");
    } else {
      const awards = JSON.parse(data);
      const formatedAwards = awards.reduce((acc, curr) => {
        if (acc[curr.entity]) {
          acc[curr.entity].push(curr.category);
        } else {
          acc[curr.entity] = [curr.category];
        }
        return acc;
      }, {});
      const winners = Object.keys(formatedAwards)
        .filter((value) => formatedAwards[value].length > 1)
        .map((value) => ({
          name: value,
          awards: formatedAwards[value],
        }));
      console.log(winners);
      res.json({ winners });
    }
  });
});

server.use("/", router);

server.listen(PORT, () => {
  console.log(`Servidor está levantado y escuchando en el puerto ${PORT}`);
});
