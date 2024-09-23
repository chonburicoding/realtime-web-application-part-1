const express = require('express')
const app = express();
const orderRouter = require('./modules/order')
const { Server } = require('socket.io')
const { seq, QueryTypes} = require('./config/db')
//const cors = require('cors')
const omise = require('omise')
const oms = omise({
    secretKey: 'skey_test_5i36vsmdeqawvjdwqd0'
})

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

app.get('/complete', (req, res)=>{
    const {order_id} = req.query
    res.send('complete order =' +order_id)
})

app.post('/api/charge', async (req, res)=>{
    const {nonce} = req.body
    const card = nonce.startsWith('tokn_')
    if(card){
        //credit card
        const data = await oms.charges.create({
            ...req.body,
            card: nonce // tokn_
        })
        res.json(data)
    }else{
        //other payment methodม etc. mobile promptpay, truemoney
        const data = await oms.charges.create({
            ...req.body,
            source: nonce // src_
        })
        res.json(data)
    }
})

app.get('/', (req, res)=>{
    // frontend
    //res.send('Hello world')
    res.render('index')
})

// localhost:3000/api/hook
app.post('/api/hook', async (req, res)=>{
    /*
    console.log(req.body)
    const order_id = req.params = req.body.data.metadata.order_id
    const status = req.body.data.status
    if(status == 'successful'){
       // update order status
        const t = await seq.transaction()
        try{
            const [data] = await seq.query(`
                UPDATE tb_order 
                SET order_status = 1
                OUTPUT INSERTED.id, INSERTED.order_status
                WHERE id = :id
            `, {
                replacements: {id: order_id},
                transaction: t,
                type: QueryTypes.SELECT
            })
            t.commit()
            req.app.io.emit('confirm_order', data)
            res.json(data)
        }catch(err){
            t.rollback()
            res.send(err.toString())
        }
    }
    */
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