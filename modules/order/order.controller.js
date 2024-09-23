const Order = require('./order.model')

class OrderController{
    model = null
    constructor(){
        this.model = new Order();
    }
    async saveOrder(req){
        try{
            const data = await this.model.saveOrder(req)
            return data
        }catch(err){
            return err.toString()
        }
    }
    async confirmOrder(req){
        try{
            const data = await this.model.confirmOrder(req)
            return data
        }catch(err){
            return err.toString()
        }
    }
}
module.exports = OrderController