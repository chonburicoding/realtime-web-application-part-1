const express = require('express')
const Router = express.Router()
const { seq, QueryTypes} = require('../../config/db')
const { v4 } = require('uuid')

Router.get('/confirm_order/:id', async (req, res)=>{
    // confirm_order/34 -- params -- req.params.id
    ///confirm_order?id=34 -- query string -- req.query.id
    const t = await seq.transaction()
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
})

Router.post('/confirm_order', async (req, res)=>{
    const t = await seq.transaction()
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
    }
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
        const {product, amount} = req.body
        // [x, y]
        // x = result
        // y = effect row
        const [data] = await seq.query(`
            INSERT INTO tb_order (order_id, product, amount)
            OUTPUT INSERTED.id, INSERTED.order_id, INSERTED.product, INSERTED.amount, 
	            INSERTED.created, INSERTED.order_status
            VALUES (:order_idx, :productx, :amountx)
        `,{
            replacements: {
                order_idx: order_id,
                productx: product,
                amountx: amount
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