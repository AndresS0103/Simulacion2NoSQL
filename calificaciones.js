//instalar estas dependencias (nota para mi):npm init -y ----- npm install express mongoose

// Llamado de librerías
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Puerto y host
const port = 3002;
const hostname = 'http://localhost';

// Permitir formato JSON en las solicitudes
app.use(express.json());

// Conexión a MongoDB en la nube
const urlNube = "mongodb+srv://xxtherealdresxx:imPWopf9sVACgA5n@simulacion2andres.rsqhk.mongodb.net/SistemaCalificaciones";
mongoose.connect(urlNube, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Base de datos en la nube conectada...'))
.catch((error) => console.log('Error al conectar a la base de datos: ' + error));

// Esquema para Calificaciones
const SchemaCalificaciones = new mongoose.Schema({
    NombreEstudiante: String,
    Cuatrimestre: Number,
    NotaMatematicas: Number,
    NotaCiencias: Number,
    NotaLiteratura: Number,
    NotaCivica: Number,
    Condicion: String
});

// Modelo para la colección "Calificaciones"
const Calificaciones = mongoose.model('Calificaciones', SchemaCalificaciones, 'Calificaciones'); // Tercer parámetro es el nombre exacto de la colección

// Rutas CRUD
// Ruta GET para obtener todas las calificaciones
app.get('/Calificaciones', async (req, res) => {
    try {
        const calificaciones = await Calificaciones.find();
        res.json(calificaciones);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las calificaciones: " + error.message });
    }
});



// Ruta POST para crear una nueva calificación
app.post('/Calificaciones', async (req, res) => {
    const { NombreEstudiante, Cuatrimestre, NotaMatematicas, NotaCiencias, NotaLiteratura, NotaCivica, Condicion } = req.body;
    const nuevaCalificacion = new Calificaciones({
        NombreEstudiante,
        Cuatrimestre,
        NotaMatematicas,
        NotaCiencias,
        NotaLiteratura,
        NotaCivica,
        Condicion
    });

    try {
        const calificacionGuardada = await nuevaCalificacion.save();
        res.status(201).json(calificacionGuardada);
    } catch (error) {
        res.status(500).json({ message: "Error al crear la calificación: " + error.message });
    }
});

// Ruta PUT para actualizar una calificación por ID
app.put('/Calificaciones/:id', async (req, res) => {
    const { NombreEstudiante, Cuatrimestre, NotaMatematicas, NotaCiencias, NotaLiteratura, NotaCivica, Condicion } = req.body;

    try {
        const calificacionActualizada = await Calificaciones.findByIdAndUpdate(
            req.params.id,
            { NombreEstudiante, Cuatrimestre, NotaMatematicas, NotaCiencias, NotaLiteratura, NotaCivica, Condicion },
            { new: true }
        );

        if (!calificacionActualizada) return res.status(404).json({ message: "Calificación no encontrada" });
        res.json(calificacionActualizada);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la calificación: " + error.message });
    }
});

// Ruta DELETE para eliminar una calificación por ID
app.delete('/Calificaciones/:id', async (req, res) => {
    try {
        const calificacionEliminada = await Calificaciones.findByIdAndDelete(req.params.id);
        if (!calificacionEliminada) return res.status(404).json({ message: "Calificación no encontrada" });
        res.json({ message: "Calificación eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la calificación: " + error.message });
    }
});


// Filtrar documentos por el nombre de un estudiante
app.get('/Calificaciones/filtrarPorNombre/:nombre', async (req, res) => {
    try {
        const nombre = req.params.nombre;
        const resultados = await Calificaciones.find({ NombreEstudiante: nombre });
        res.json(resultados);
    } catch (error) {
        res.status(500).json({ message: "Error al filtrar por nombre: " + error.message });
    }
});

//Filtrar documentos por cuatrimestre específico por estudiante
app.get('/Calificaciones/filtrarPorCuatrimestre/:nombre/:cuatrimestre', async (req, res) => {
    try {
        const { nombre, cuatrimestre } = req.params;
        const resultados = await Calificaciones.find({
            NombreEstudiante: nombre,
            Cuatrimestre: parseInt(cuatrimestre)
        });
        res.json(resultados);
    } catch (error) {
        res.status(500).json({ message: "Error al filtrar por cuatrimestre: " + error.message });
    }
});

/// Mostrar estudiantes con nota menor a 70 en ciencias
app.get('/Calificaciones/menorA70Ciencias', async (req, res) => {
    try {
        const resultados = await Calificaciones.find({ NotaCiencias: { $lt: 70 } });
        res.json(resultados);
    } catch (error) {
        res.status(500).json({ message: "Error al buscar estudiantes con nota menor a 70 en ciencias: " + error.message });
    }
});


// Ruta GET para obtener una calificación por ID
app.get('/Calificaciones/:id', async (req, res) => {
    try {
        const calificacion = await Calificaciones.findById(req.params.id);
        if (!calificacion) return res.status(404).json({ message: "Calificación no encontrada" });
        res.json(calificacion);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la calificación: " + error.message });
    }
});

//Promedio de calificaciones para un cuatrimestre específico en todas las materias
app.get('/Calificaciones/promedioPorCuatrimestre/:cuatrimestre', async (req, res) => {
    try {
        const cuatrimestre = parseInt(req.params.cuatrimestre);
        const resultados = await Calificaciones.aggregate([
            { $match: { Cuatrimestre: cuatrimestre } },
            {
                $group: {
                    _id: "$Cuatrimestre",
                    promedioMatematicas: { $avg: "$NotaMatematicas" },
                    promedioCiencias: { $avg: "$NotaCiencias" },
                    promedioLiteratura: { $avg: "$NotaLiteratura" },
                    promedioCivica: { $avg: "$NotaCivica" }
                }
            }
        ]);
        res.json(resultados);
    } catch (error) {
        res.status(500).json({ message: "Error al calcular el promedio por cuatrimestre: " + error.message });
    }
});


// Inicializar el servidor
app.listen(port, () => {
    console.log(`El servidor se está ejecutando en ${hostname}:${port}`);
});
