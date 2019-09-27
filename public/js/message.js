
function sendmessage(){
    let content = $('#contentmessage');
    let message = content.val();
    let type = $ ("input[name=typesend]:checked").val();
    $.ajax({
        method:"post",
        url:"/send-all-message",
        data:{message:message,type:type},
        success:(data)=>{
           alert("Tin nhắn Sẽ Gửi Sau:" + data + " Giây");
        }
    })
    
}