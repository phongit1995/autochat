$(document).ready(function(){
    $('.btn-donate').click(function(){
        let username = $('#username').val() ;
        let password = $('#password').val() ;
        if(username==""|| password==""){
           return  Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Vui Lòng Nhập Tên Tài Khoản hoặc Mật Khẩu' 
            })
        }
        $.ajax({
            url:'/donateaccount',
            method:'post',
            data:{
                username,
                password
            },
            success: function(data){
                console.log(data);
                if(data.error){
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Tên Tài Khoản Hoặc Mk Chưa Chính Xác' 
                    })
                }
                else{
                    Swal.fire({
                        icon: 'success',
                        title: 'Oops...',
                        text: 'Cảm Ơn Bạn Đã Ủng Hộ Website'
                    })
                }
                $('#username').val("") ;
                $('#password').val("") ;
            }
        })
    })
})