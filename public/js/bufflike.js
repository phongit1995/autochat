$(document).ready(function(){
    $('.buffaction').click(function(){
        let ID = $('#idPost').val();
        if(!Number.isInteger( parseInt( ID))){
            return Swal.fire(
                'Lỗi!',
                'Vui Lòng Chọn Id đúng',
                'error'
              )
        }
        let numberLike = $('#numberLike').val();
        if(!Number.isInteger( parseInt( numberLike))){
            return Swal.fire(
                'Lỗi!',
                'Vui Lòng Chọn Số Tim đúng',
                'error'
              )
        }
        console.log(ID,numberLike);
        $.ajax({
            url:'/admin/bufflike/sendlike',
            method:'post',
            data:{
                id:ID,
                numberLike:numberLike
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
})