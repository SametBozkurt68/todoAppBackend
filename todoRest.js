import express from 'express';
import bodyParser from 'body-parser';
import { Sequelize, DataTypes } from 'sequelize';
import cors from "cors";

const app = express();
app.use(express.json()); 
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
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, 
{   
    freezeTableName: true,
    timestamps: false 
});

sequelize.authenticate()
    .then(() => {
        console.log('Veritabanı bağlantısı başarılı.');
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
    const { todo_adi, date } = req.body;

    // Girdi doğrulama
    if (!todo_adi || !date) {
        return res.status(400).json({ error: 'Todo adı ve tarih gereklidir' });
    }

    try {
        const data = await Task.create({ todo_adi, date });
        res.json({ data });
    } catch (error) {
        console.error('Görev eklenemedi:', error);
        res.status(500).send('Sunucu hatası');
    }
});

app.post('/todo-update', async (req, res) => {
    const { todo_id, todo_adi, date } = req.body;

    // Girdi doğrulama
    if (!todo_id || !todo_adi || !date) {
        return res.status(400).json({ error: 'Todo ID, adı ve tarih gereklidir' });
    }

    try {
        const status = await Task.update(
            { todo_adi, date },
            { where: { todo_id } }
        );
        
        if (status[0] === 0) {
            return res.status(404).json({ error: 'Görev bulunamadı' });
        }

        res.json({ message: 'Görev başarıyla güncellendi' });
    } catch (error) {
        console.error('Görev güncellenemedi:', error);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

app.post('/todo-delete', async (req, res) => {
    const id = req.body.todo_id;

    // Silme işlemi doğrulama
    if (!id) {
        return res.status(400).json({ error: 'Todo ID gereklidir' });
    }

    try {
        const status = await Task.destroy({ where: { todo_id: id } });

        if (status === 0) {
            return res.status(404).json({ error: 'Görev bulunamadı' });
        }

        res.json({ message: 'Görev başarıyla silindi' });
    } catch (error) {
        console.error('Görev silinemedi:', error);
        res.status(500).send('Sunucu hatası');
    }
});

const port = 3100;
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
