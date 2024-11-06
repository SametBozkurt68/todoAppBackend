import express from 'express';
import bodyParser from 'body-parser';
import { Sequelize, DataTypes } from 'sequelize';
import cors from "cors";

const app = express();
app.use(express.json()); // JSON verileri için
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

const sequelize = new Sequelize('todoapp', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

const Task = sequelize.define('todo', {
    todo_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    todo_adi: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: false 
});

sequelize.authenticate()
    .then(() => {
        console.log('Veritabani bağlantısı başarılı.');
        return sequelize.sync(); 
    })
    .then(() => console.log('Tablolar senkronize edildi.'))
    .catch(err => console.error('Veritabanı bağlantısı başarısız:', err));


app.get('/todo-find-all', async (_req, res) => {
    try {
        const tasks = await Task.findAll();
        res.json(tasks);
    } catch (error) {
        console.error('Görevler alınamadı:', error);
        res.status(500).send('Sunucu hatası');
    }
});

app.post('/todo-add', async (req, res) => {
    console.log(req.body.todo_adi)
    const newTask = req.body.todo_adi; 
    let data = await Task.create({ todo_adi: newTask }); 
    res.json({data:data})
});


app.post('/todo-delete', async (req, res) => {
    const id = req.body.todo_id; 
   let status = await Task.destroy({ where: { todo_id: id } }); 
    res.json({data:status})
});



app.post('/todo-update', async (req, res) => {
    const id = req.body.todo_id;
    const updatedTask = req.body.todo_adi; 
    let status = await Task.update({ todo_adi: updatedTask }, { where: { todo_id: id } }); 
    res.json({data:status})
});



const port = 3100;
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});