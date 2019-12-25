$(document).ready(function(){
    $('.resultcheck').hide();
    $('.checkUser').click(function(){
        let ID = $('#idUser').val();
        console.log(ID);
        if(!Number.isInteger( parseInt( ID))){
            return Swal.fire(
                'Lỗi!',
                'Vui Lòng Chọn Id đúng',
                'error'
              )
        }
        $.ajax({
            url:'/admin/bufftim/checkUser',
            method:'post',
            data:{
                id:ID
            }
            ,
            success:function(data){
                console.log(data);
                if(data.error==""){
                    $('#result').text(data.numberbuffed);
                    $('.resultcheck').show();
                }
            }
        })
    })
})