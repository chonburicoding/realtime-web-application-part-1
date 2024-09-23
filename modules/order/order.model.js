const { seq, QueryTypes} = require('../../config/db')

class Order{
    async saveOrder(req){
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
            return data
        }catch(err){
            t.rollback()
            return err.toString()
        }
    }

    async confirmOrder(req){
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
            return data
        }catch(err){
            t.rollback()
            return err.toString()
        }
    }
}

module.exports = Order