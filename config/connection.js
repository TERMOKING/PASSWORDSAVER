

const mongoClient = require('mongodb').MongoClient


const predictionDb={
    db:null
}



module.exports.connect=(done)=>{
    
    mongoClient.connect('mongodb+srv://predictionbot:deepu123@cluster0.oq5zb6e.mongodb.net/?retryWrites=true&w=majority',{useNewUrlParser:true},(err,data)=>{
        if(err) return done(err)
        predictionDb.db=data.db('Prediction')
        done()
    })
}

module.exports.predictionDb=function(){
    return predictionDb.db
}

