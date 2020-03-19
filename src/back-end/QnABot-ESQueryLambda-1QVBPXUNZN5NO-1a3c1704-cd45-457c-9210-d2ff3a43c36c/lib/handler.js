var Url=require('url')
var Promise=require('bluebird')
var request=require('./request')

module.exports= (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    request({
        url:Url.resolve("https://"+event.endpoint,event.path),
        method:event.method,
        body:event.body 
    })
    .tap(x=>test(x))
    .tapCatch(x=>console.log(x))
    .then(result=>callback(null,result))
    .catch(error=>callback(JSON.stringify({
        type:error.response.status===404 ? "[NotFoud]" : "[InternalServiceError]",
        status:error.response.status,
        message:error.response.statusText,
        data:error.response.data
    })))
}

function test(result){
    console.log('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',JSON.stringify(result))
    if(result.hits.max_score <process.env.ES_TOLERANCE){
        result.hits.total = 0;
        result.hits.max_score = null;
        result.hits.hits =[];

    }
    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',JSON.stringify(result))
}