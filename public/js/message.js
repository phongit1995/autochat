$(document).ready(function(){
    $(".result-send").hide();
})
function sendmessage(){
    let content = $('#contentmessage');
    let message = content.val();
    let type = $ ("input[name=typesend]:checked").val();
    $(".result-send").show();
    $.ajax({
        method:"post",
        url:"/send-all-message",
        data:{message:message,type:type},
        success:(data)=>{
            $(".SumRequest").text(data);
            $(".content-send").empty();
           console.log(data);
        }
    })
    
}
const socket = io();
