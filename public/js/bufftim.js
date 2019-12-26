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
    $('.buffaction').click(function(){
        let ID = $('#idUser').val();
        if(!Number.isInteger( parseInt( ID))){
            return Swal.fire(
                'Lỗi!',
                'Vui Lòng Chọn Id đúng',
                'error'
              )
        }
        let numberTim = $('#numberTim').val();
        if(!Number.isInteger( parseInt( numberTim))){
            return Swal.fire(
                'Lỗi!',
                'Vui Lòng Chọn Số Tim đúng',
                'error'
              )
        }
        console.log(ID,numberTim);
        $.ajax({
            url:'/admin/bufftim/sendtim',
            method:'post',
            data:{
                id:ID,
                numberTim:numberTim
            },
            success:function(data){
                console.log(data);
                if(data.error==""){
                    Swal.fire(
                        'Thành Công!',
                        'Buff Thành Công',
                        'success'
                      )
                }
                else{
                    return Swal.fire(
                        'Lỗi!',
                        'Vui Lòng Chọn Số Tim đúng',
                        'error'
                      )
                }
            }
        })
    })
    $('.changeId').click(function(){
        let username = $('#usernameEdit').val();
        let idweb = $('#idwebEdit').val();
        console.log(username,idweb);
        $.ajax({
            url:"/admin/bufftim/changinfo",
            method:'post',
            data:{
                username,
                idweb
            },
            success:function(data){
                if(data.error==""){
                    Swal.fire(
                        'Thành Công!',
                        'Cập Nhật Thành Công',
                        'success'
                      )
                      $('#usernameEdit').val("");
                      $('#idwebEdit').val("");
                }
                else{
                    return Swal.fire(
                        'Lỗi!',
                        'Có Lỗi Xảy Ra',
                        'error'
                      )
                }
            }
        })
    })
})