socket.on("server-send-status-send-message",(data)=>{
    console.log(data);
    let content = $(".content-send");
    let message = `` ;
    let result = JSON.parse(data.result);
    let numbernow = Number($(".numberNow").text());
    numbernow+=1 ;
    console.log(result);
    $(".numberNow").text(numbernow);

    if(result.status=="200" && result.error==""){
            message= `<div class="message-sucess">Gửi Thành Công Tới <span class="idmessage"> ${ data.id} <span> 
                <a href="https://gaubong.us/mail/index.php?act=write&id=${data.id}" target="__blank">Chi Tiết</a>
            </div>` ;
    }
    else{
        message= `<div class="message-error">Gửi Không Thành Công Tới ${ data.id} . Message : ${result.error}</div>` ;
    }
    content.append(message);
})