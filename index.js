const express = require('express')
const app = express();
const orderRouter = require('./modules/order')
const { Server } = require('socket.io')
//const cors = require('cors')

app.use(express.json())
//app.use(cors())
// server อ่านค่าจาก client
// แล้วค่าให้เราผ่าน req.body object

// req.params, req.query
// server default ไว้ให้แล้ว

app.set('view engine', 'ejs')
app.set('views', __dirname+'/public')
app.use(express.static(__dirname+'/public'))

app.use('/order', orderRouter)

app.get('/', (req, res)=>{
    // frontend
    //res.send('Hello world')
    res.render('index')
})

// localhost:3000/api/hook
app.post('/api/hook', (req, res)=>{
    // payment data
    // req.app.io.emit()
})

const app_server = app.listen(3000, ()=>{
    console.log('Server is running on port 3000')
})

const io = new Server(app_server)
app.io = io
io.on('connection', (socket)=>{
    console.log(socket.id + ' is connected')
    socket.on('disconnect', ()=>{
        console.log(socket.id + ' is disconnected')
    })
})