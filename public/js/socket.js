socket.on("server-send-status-send-message",(data)=>{
    console.log(data);
    let content = $(".content-send");
    console.log(content);
    let message = `` ;
    console.log(typeof data.result);
    let result = JSON.parse(data.result);
    console.log(result);
    if(result.status){
        if(result.res==""){
            message= `<div class="message">Gửi Thành Công Tới ${ data.id}</div>`
        } else{
            message= `<div class="message">Gửi Không Thành Công Tới ${ data.id} . Message : ${data.result.res}</div>` ;
        }
    }
    else{
        message= `<div class="message">Gửi Không Thành Công Tới ${ data.id} . Message : Lỗi Server </div>`
    }
    content.append(message);
})