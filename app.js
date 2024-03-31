// OPENAI PERO CON LIMITE DE TAMAÑO

// const express = require("express");
// const multer = require("multer");
// const pdfParse = require("pdf-parse");
// const fs = require("fs");
// const say = require("say");
// const path = require("path");
// const OpenAI = require("openai");
// const apiKey = process.env.OPENAI_API_KEY;

// const openai = new OpenAI(apiKey);

// const speechFile = path.resolve("./speech.mp3");

// const app = express();
// const PORT = process.env.PORT || 3000;

// const upload = multer({ dest: "uploads/" });

// app.use(express.json());

// // Endpoint para manejar la carga de archivos
// app.post("/text2audio", upload.single("archivo"), async (req, res) => {
//   const filePath = req.file.path; // Ruta del archivo cargado
//   console.log("Archivo cargado:", filePath);

//   try {
//     // Leer el archivo PDF y extraer texto
//     const data = await fs.promises.readFile(filePath);
//     const pdfData = await pdfParse(data);

//     // Texto extraído del PDF
//     const text = pdfData.text;
//     console.log("Texto extraído:", text);

//     // Crear archivo de audio a partir del texto utilizando OpenAI
//     const mp3 = await openai.audio.speech.create({
//       model: "tts-1",
//       voice: "alloy",
//       input: text,
//     });

//     // Escribir el archivo de audio
//     await fs.promises.writeFile(speechFile, mp3.audio());

//     console.log("¡Archivo de audio creado con éxito!");

//     // Enviar el archivo de audio como respuesta descargable
//     res.download(speechFile, "audio.mp3");
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("Error al procesar el archivo");
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Servidor escuchando en el puerto ${PORT}`);
// });
// FUNCIONA PERO NO DESCARGA
// const express = require("express");
// const multer = require("multer");
// const pdfParse = require("pdf-parse");
// const fs = require("fs");
// const say = require("say");

// const app = express();
// const PORT = process.env.PORT || 3000;

// const upload = multer({ dest: "uploads/" });

// app.use(express.json());

// // Función para limpiar el texto
// function limpiarTexto(texto) {
//   // Reemplazar caracteres especiales con sus equivalentes en español
//   texto = texto.replace(/á/g, "a");
//   texto = texto.replace(/é/g, "e");
//   texto = texto.replace(/í/g, "i");
//   texto = texto.replace(/ó/g, "o");
//   texto = texto.replace(/ú/g, "u");
//   texto = texto.replace(/ñ/g, "ni");
//   // Otros reemplazos necesarios...

//   return texto;
// }

// // Endpoint para manejar la carga de archivos
// app.post("/text2audio", upload.single("archivo"), (req, res) => {
//   const filePath = req.file.path; // Ruta del archivo cargado
//   console.log("Archivo cargado:", filePath);

//   // Leer el archivo PDF y extraer texto
//   fs.readFile(filePath, (err, data) => {
//     if (err) {
//       console.error("Error al leer el archivo:", err);
//       res.status(500).send("Error al leer el archivo");
//       return;
//     }

//     pdfParse(data)
//       .then(function (pdfData) {
//         // Texto extraído del PDF
//         let text = pdfData.text;
//         // console.log("Texto extraído:", text);

//         // Limpiar el texto
//         text = limpiarTexto(text);

//         // Convertir texto a audio utilizando say
//         say.speak(text, null, 1, (err) => {
//           if (err) {
//             console.error("Error al convertir texto a audio:", err);
//             res.status(500).send("Error al convertir texto a audio");
//             return;
//           }
//           console.log("¡Texto convertido a audio con éxito!");

//           // Enviar una respuesta de éxito
//           res.send("¡Texto convertido a audio con éxito!");
//         });
//       })
//       .catch(function (error) {
//         console.error("Error al extraer texto:", error);
//         res.status(500).send("Error al extraer texto del archivo");
//       });
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Servidor escuchando en el puerto ${PORT}`);
// });
const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const say = require("say");

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: "uploads/" });

app.use(express.json());
// Permitir acceso local (cambiar por la url definitiva)
app.use(
  cors({
    origin: "http://localhost:8080",
  })
);

// Función para limpiar el texto
function limpiarTexto(texto) {
  texto = texto.replace(/á/g, "a");
  texto = texto.replace(/é/g, "e");
  texto = texto.replace(/í/g, "i");
  texto = texto.replace(/ó/g, "o");
  texto = texto.replace(/ú/g, "u");
  texto = texto.replace(/ñ/g, "ni");

  return texto;
}

// Endpoint para manejar la carga de archivos
app.post("/text2audio", upload.single("archivo"), (req, res) => {
  const filePath = req.file.path; // Ruta del archivo cargado
  console.log("Archivo cargado:", filePath);

  // Leer el archivo PDF y extraer texto
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error("Error al leer el archivo:", err);
      res.status(500).send("Error al leer el archivo");
      return;
    }

    pdfParse(data)
      .then(function (pdfData) {
        // Texto extraído del PDF
        let text = pdfData.text;
        // console.log("Texto extraído:", text);

        // Limpiar el texto
        text = limpiarTexto(text);

        // Convertir texto a audio utilizando say
        say.export(text, null, 1, "hal.wav", (err) => {
          if (err) {
            console.error("Error al convertir texto a audio:", err);
            res.status(500).send("Error al convertir texto a audio");
            fs.unlinkSync(filePath); // Eliminar el archivo PDF cargado
            return;
          }
          console.log("¡Texto convertido a audio con éxito!");

          // Configurar encabezados de respuesta
          res.set("Content-Type", "audio/wav");
          res.set("Content-Disposition", 'attachment; filename="audio.wav"');

          // Enviar el archivo de audio al cliente como descarga
          res.download("hal.wav", "audio.wav", (err) => {
            if (err) {
              console.error("Error al enviar el archivo de audio:", err);
              res.status(500).send("Error al enviar el archivo de audio");
            } else {
              console.log("¡Archivo de audio enviado con éxito!");

              // Eliminar el archivo PDF cargado
              fs.unlinkSync(filePath);
            }
          });
        });
      })
      .catch(function (error) {
        console.error("Error al extraer texto:", error);
        res.status(500).send("Error al extraer texto del archivo");
      });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
