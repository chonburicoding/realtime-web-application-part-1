const express = require('express')
const Router = express.Router()
const { seq, QueryTypes} = require('../../config/db')
const { v4 } = require('uuid')
const OrderController = require('./order.controller')
const order = new OrderController()

Router.get('/confirm_order/:id', async (req, res)=>{
    // confirm_order/34 -- params -- req.params.id
    ///confirm_order?id=34 -- query string -- req.query.id
    
    /*const t = await seq.transaction()
    try{
        const {id} = req.params
        const [data] = await seq.query(`
            UPDATE tb_order 
            SET order_status = 1
            OUTPUT INSERTED.id, INSERTED.order_status
            WHERE id = :id
        `, {
            replacements: {id},
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
    */
    try{
        const data = await order.saveOrder(req)
        req.app.io.emit('confirm_order', data)
        res.json(data)
    }catch(err){
        t.rollback()
        res.send(err.toString())
    }
})

Router.post('/omise/hook', async (req, res)=>{
    const order_id = req.params = req.body.data.metadata.order_id
    const status = req.body.data.status
    req.body.id = order_id
    //req.body = {...req.body, id: order_id}
    if(status == 'successful'){
        try{
            const data = await order.confirmOrder(req)
            req.app.io.emit('confirm_order', data)
            res.json(data)
        }catch(err){
            t.rollback()
            res.send(err.toString())
        }
    }
})

Router.post('/confirm_order', async (req, res)=>{
    try{
        const data = await order.confirmOrder(req)
        req.app.io.emit('confirm_order', data)
        res.json(data)
    }catch(err){
        t.rollback()
        res.send(err.toString())
    }
    /*const t = await seq.transaction()
    try{
        const {id} = req.body
        const [data] = await seq.query(`
            UPDATE tb_order 
            SET order_status = 1
            OUTPUT INSERTED.id, INSERTED.order_status
            WHERE id = :id
        `, {
            replacements: {id},
            transaction: t,
            type: QueryTypes.SELECT
        })
        t.commit()
        req.app.io.emit('confirm_order', data)
        res.json(data)
    }catch(err){
        t.rollback()
        res.send(err.toString())
    }*/
})

Router.get('/order_list', async (req, res)=>{
    try{
       const data = await seq.query('SELECT * FROM tb_order ORDER BY id ASC', {
        type: QueryTypes.SELECT
       })
       res.json(data)
    }catch(err){
        res.send(err.toString())
    }
})

Router.post('/add_order', async (req, res)=>{
    //sql injection
    // error
    const t = await seq.transaction()
    try{
        const order_id = v4();
        const {product, unit_price, amount} = req.body
        // [x, y]
        // x = result
        // y = effect row
        const [data] = await seq.query(`
            INSERT INTO tb_order (order_id, product, amount, unit_price, total)
            OUTPUT INSERTED.id, INSERTED.order_id, INSERTED.product, INSERTED.amount, 
	            INSERTED.created, INSERTED.order_status, INSERTED.unit_price, INSERTED.total
            VALUES (:order_idx, :productx, :amountx, :unit_pricex, :totalx)
        `,{
            replacements: {
                order_idx: order_id,
                productx: product,
                amountx: amount,
                unit_pricex: unit_price,
                totalx: amount * unit_price
            },
            transaction: t,
            type: QueryTypes.SELECT
        })
        console.log(data)
        t.commit()
        req.app.io.emit('order', data)
        res.json(data)
    }catch(err){
        t.rollback()
        res.send(err.toString())
    }
})

module.exports = Router