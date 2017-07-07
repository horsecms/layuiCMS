var $;
layui.config({
	base : "../../js/"
}).use(['form','layer','layedit'],function(){
    var form = layui.form(),
        layer = parent.layer === undefined ? layui.layer : parent.layer,
        layedit = layui.layedit;
        $ = layui.jquery;

    //消息回复
    var editIndex = layedit.build('msgReply',{
         tool: ['face'],
         height:100
    });
        
    form.on('select(selectMsg)',function(data){
        var len = $(".msgHtml tr").length;
        for(var i=0;i<len;i++){
            if(data.value == "0"){
                $(".msgHtml tr").eq(i).show();
                $(".msgHtml tr.no_msg").remove();
            }else{
                if($(".msgHtml tr").eq(i).find(".msg_collect i").hasClass("icon-star")){
                    $(".msgHtml tr").eq(i).show();
                }else{
                    $(".msgHtml tr").eq(i).hide();
                }
            }
        }
        if(data.value=="1" && $(".msgHtml tr").find(".msg_collect i.icon-star").length=="0"){
            $(".msgHtml").append("<tr class='no_msg' align='center'><td colspan='4'>暂无收藏消息</td></tr>")
        }
    })

    //加载数据
    $.get("../../json/message.json",function(data){
        var msgHtml = '',msgReply;
        for(var i=0; i<data.length; i++){
            if(data[i].msgReply && data[i].msgReply.length != 0){
                msgReply = "已回复";
            }else{
                msgReply = "";
            }
            msgHtml += '<tr>';
            msgHtml += '  <td class="msg_info">';
            msgHtml += '    <img src="'+data[i].userface+'" width="50" height="50"><input type="hidden" value="'+data[i].msgId+'">';
            msgHtml += '    <div class="user_info">';
            msgHtml += '        <h2>'+data[i].userName+'</h2>';
            msgHtml += '        <p>'+data[i].userAsk+'</p>';
            msgHtml += '    </div>';
            msgHtml += '  </td>';
            msgHtml += '  <td class="msg_time">'+data[i].askTime+'</td>';
            msgHtml += '  <td class="msg_reply">'+msgReply+'</td>';
            msgHtml += '  <td class="msg_opr">';
            msgHtml += '    <a class="layui-btn layui-btn-mini layui-btn-normal msg_collect"><i class="layui-icon">&#xe600;</i> 收藏</a>';
            msgHtml += '    <a class="layui-btn layui-btn-mini reply_msg"><i class="layui-icon">&#xe611;</i> 回复</a>';
            msgHtml += '  </td>';
            msgHtml += '</tr>';
        }
        $(".msgHtml").html(msgHtml);
    })

    //操作
    $("body").on("click",".msg_collect",function(){  //收藏
        if($(this).text().indexOf("已收藏") > 0){
            layer.msg("取消收藏成功！");
            $(this).html("<i class='layui-icon'>&#xe600;</i> 收藏");
        }else{
            layer.msg("收藏成功！");
            $(this).html("<i class='iconfont icon-star'></i> 已收藏");
        }
    })

    //回复
    $("body").on("click",".reply_msg,.msgHtml .user_info h2,.msgHtml .msg_info>img",function(){
        var id = $(this).parents("tr").find("input[type=hidden]").val();
        var userName = $(this).parents("tr").find(".user_info h2").text();
        var index = layui.layer.open({
            title : "与 "+userName+" 的聊天",
            type : 2,
            content : "messageReply.html",
            success : function(layero, index){
                setTimeout(function(){
                    layui.layer.tips('点击此处返回消息列表', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                },500)
                var body = layui.layer.getChildFrame('body', index);
                //加载回复信息
                $.get("../../json/message.json",function(data){
                    var msgReplyHtml = '',msgReply;
                    for(var i=0; i<data.length; i++){
                        if(data[i].msgReply && data[i].msgReply.length != 0){
                            msgReply = "已回复";
                        }else{
                            msgReply = "";
                        }
                        if(data[i].msgId == id){
                            if(data[i].msgReply && data[i].msgReply.length != 0){
                                for(var j=0;j<data[i].msgReply.length;j++){
                                    msgReplyHtml += '<tr>';
                                    msgReplyHtml += '  <td class="msg_info">';
                                    msgReplyHtml += '    <img src="'+data[i].msgReply[j].userface+'" width="50" height="50">';
                                    msgReplyHtml += '    <div class="user_info">';
                                    msgReplyHtml += '        <h2>'+data[i].msgReply[j].userName+'</h2>';
                                    msgReplyHtml += '        <p>'+data[i].msgReply[j].userAsk+'</p>';
                                    msgReplyHtml += '    </div>';
                                    msgReplyHtml += '  </td>';
                                    msgReplyHtml += '  <td class="msg_time">'+data[i].msgReply[j].askTime+'</td>';
                                    msgReplyHtml += '  <td class="msg_reply"></td>';
                                    msgReplyHtml += '</tr>';
                                }
                            }
                            msgReplyHtml += '<tr>';
                            msgReplyHtml += '  <td class="msg_info">';
                            msgReplyHtml += '    <img src="'+data[i].userface+'" width="50" height="50">';
                            msgReplyHtml += '    <div class="user_info">';
                            msgReplyHtml += '        <h2>'+data[i].userName+'</h2>';
                            msgReplyHtml += '        <p>'+data[i].userAsk+'</p>';
                            msgReplyHtml += '    </div>';
                            msgReplyHtml += '  </td>';
                            msgReplyHtml += '  <td class="msg_time">'+data[i].askTime+'</td>';
                            msgReplyHtml += '  <td class="msg_reply">'+msgReply+'</td>';
                            msgReplyHtml += '</tr>';
                        }
                    }
                    body.find(".msgReplyHtml").html(msgReplyHtml);
                })
            }
        })
        //改变窗口大小时，重置弹窗的高度，防止超出可视区域（如F12调出debug的操作）
        $(window).resize(function(){
            layui.layer.full(index);
        })
        layui.layer.full(index);
    })

    //提交回复
    var message = [];
    $(".send_msg").click(function(){
        if(layedit.getContent(editIndex) != ''){
            var replyHtml = '',msgStr;
            replyHtml += '<tr>';
            replyHtml += '  <td class="msg_info">';
            replyHtml += '    <img src="../../images/face.jpg" width="50" height="50">';
            replyHtml += '    <div class="user_info">';
            replyHtml += '        <h2>请叫我马哥</h2>';
            replyHtml += '        <p>'+layedit.getContent(editIndex)+'</p>';
            replyHtml += '    </div>';
            replyHtml += '  </td>';
            replyHtml += '  <td class="msg_time">'+formatTime(new Date())+'</td>';
            replyHtml += '  <td class="msg_reply"></td>';
            replyHtml += '</tr>';
            $(".msgReplyHtml").prepend(replyHtml);
            $("#LAY_layedit_1").contents().find("body").html('');
        }else{
            layer.msg("请输入回复信息");
        }
    })
})


function formatTime(_time){
    var year = _time.getFullYear();
    var month = _time.getMonth()+1<10 ? "0"+(_time.getMonth()+1) : _time.getMonth()+1;
    var day = _time.getDate()<10 ? "0"+_time.getDate() : _time.getDate();
    var hour = _time.getHours()<10 ? "0"+_time.getHours() : _time.getHours();
    var minute = _time.getMinutes()<10 ? "0"+_time.getMinutes() : _time.getMinutes();
    return year+"-"+month+"-"+day+" "+hour+":"+minute;
}

