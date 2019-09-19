
function sendmessage(){
    let content = $('#contentmessage');
    let message = content.val();
    content.val("");
    $.ajax({
        method:"post",
        url:"/send-message/female",
        data:{message:message},
        success:(data)=>{
           alert("Tin nhắn Sẽ Gửi Sau:" + data + " Giây");
        }
    })
    
}