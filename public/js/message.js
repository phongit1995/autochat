$(document).ready(function () {
  $(".result-send").hide();
});
function sendmessage() {
  let content = $("#contentmessage");
  let message = content.val();
  let type = $("input[name=typesend]:checked").val();
  $(".result-send").show();
  $.ajax({
    method: "post",
    url: "/send-all-message",
    data: { message: message, type: type },
    success: (data) => {
      $(".SumRequest").text(data.count);
      $(".content-send").empty();
      console.log(data);
    },
  });
}
const socket = io();
function getInfo() {
  console.log("fetch Data");
  $.ajax({
    method: "post",
    url: "/get-info",
    success: (data) => {
      //   $(".SumRequest").text(data.count);
      //   $(".content-send").empty();
      console.log(data);
      const result = data.listData.map((item) => {
        return `
                <div class="item">
                    <span>id : ${item}</span>
                    <button type="button" class="btn btn-primary" onclick="sendToUser(${item})" id="userInfo${item}">Gửi tin nhắn</button>
                </div>
            `;
      });
      $("#listOnlineData").html(result.join(""));
    },
  });
}
function sendToUser(userId) {
  console.log("userId", userId);
  let content = $("#contentmessage");
  let message = content.val();
  $.ajax({
    method: "post",
    url: "/send-to-user",
    data: { message: message, userId: userId },
    success: (data) => {
      console.log(data);
      $("#userInfo" + userId).hide();
    },
  });
}
