const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const path = require("path");

const dev = false;
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 3005;
const app = next({ dev, dir: __dirname, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        await handle(req, res);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> QPET LMS Server ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error("FATAL Next.js prepare error:", err);
    process.exit(1);
  });
