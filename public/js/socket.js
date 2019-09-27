socket.on("server-send-status-send-message",(data)=>{
    console.log(data);
    let content = $(".content-send");
    console.log(content);
    let message = `` ;
    console.log(typeof data.result);
    let result = JSON.parse(data.result);
    let numbernow = $(".numberNow").text();
    numbernow+=1 ;
    $(".numberNow").text(numbernow);
    if(result.status){
        if(result.res==""){
            message= `<div class="message-sucess">Gửi Thành Công Tới <span class="idmessage"> ${ data.id} <span> 
                <a href="https://chimbuom.us/mail/index.php?act=write&id=${data.id}" target="__blank">Chi Tiết</a>
            </div>`
        } else{
            message= `<div class="message-error">Gửi Không Thành Công Tới ${ data.id} . Message : ${data.result.res}</div>` ;
        }
    }
    else{
        message= `<div class="message-error">Gửi Không Thành Công Tới ${ data.id} . Message : Lỗi Server </div>`
    }
    content.append(message);
})