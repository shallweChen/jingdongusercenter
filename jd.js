//请求页眉和页尾,显示登陆框
$(document).ready(function(){
	$('#header').load('header.php');
	$('#footer').load('footer.php');
	$('.modal').fadeIn();
});
//验证登录
$('#btSubmit').click(function(){
  //获得用户的所有输入——表单序列化
  var requestData = $('form').serialize();
  /**将用户输入异步提交给服务器，进行用户名和密码的验证**/
  $.post('data/login.php',requestData, function(data){
    //登录失败
	if(data.code!==1){
		$('.modal-content span').html('<h1>'+data.msg+'</h1>');
    }else{ 
	//登录成功
		var uname = $('[name="uname"]').val();
		$('.modal-content span').html('<h1>欢迎回来：'+uname+'</h1>');
		$('div.rt ul li:first').html('<span>欢迎回来：'+uname+'</span>');
		$('.modal').fadeOut(3000);
		getMyOrders(uname,1);
    }
  });
});
//为主体添加导航，右侧内容切换
$('#'+$('#main_nav>ul>li[class="hover"]').attr('name')).show().siblings().hide();
$('#main_nav>ul').on('mouseover','li',function(){
	$(this).addClass('hover').siblings().removeClass();
	$('#'+$(this).attr('name')).show().siblings().hide();
});
//读取服务器中的订单信息，添加到页面
function getMyOrders( uname,pno ){
	$.getJSON('data/jd_orders.php',{'uname':uname,'pno':pno},function(pager){
		$('#jd_orders>table>tbody').empty();
		$.each(pager.data,function(i,row){
			var html=`
					<tr class="firstTr">
						<td colspan="6">订单编号：${row.order_num}<a href="#">${row.shop_name}</a></td>	
					</tr>	
					<tr class="secondTr">
						<td>
			`;
			//添加图片
			$.each(row.productList,function(i,rowP){
				html+=`<img src=${rowP.product_img}>`;
			});
			html+=`		</td>
						<td class="center">${row.user_name}</td>
						<td class="center">￥${row.price}<br>${row.payment_mode}</td>
						//把订单时间中的T替换为<br>
						<td class="center">${row.submit_time.replace('T', '<br>')}</td>
						<td class="center">${row.order_state==1?'等待付款':(row.order_state==2?'等待付款':(row.order_state==3?'正在发货':'订单完成'))}</td>
						<td class="center">
							<a href="#">查看</a><br>
							<a href="#">评价晒单</a><br>
							<a href="#">还要买</a><br>
						</td>
					</tr>
			`;
			$('#jd_orders>table>tbody').append(html);
			//生成分页条
			$('#pager').empty();
			var lis=`<li><a href="javascript:getMyOrders('${uname}',((${pager.currentPage}==1)?1:${pager.currentPage-1}))">&lt; 上一页</a></li>`;
			for(var i=0;i<pager.pageCount;i++){
				if((i+1)==pno){
					lis+=`<li class="active"><a href="javascript:getMyOrders('${uname}',${i+1})">${i+1}</a></li>`;
				}else{
					lis+=`<li><a href="javascript:getMyOrders('${uname}',${i+1})">${i+1}</a></li>`;
				}
			};
			lis+=`<li><a href="javascript:getMyOrders('${uname}',((${pager.currentPage}==${pager.pageCount})?${pager.pageCount}:${pager.currentPage+1}))">下一页 &gt;</a></li>`;
			$('#pager').append(lis);
		});
	});
};
$('[name="record"]').mouseover(function () {
	// 向服务器异步请求消费统计数据
	$.get('data/buy_state.php',{uname:'qiangdong'},function (arr) {
		/*绘制统计图需要的变量*/
		var canvasWidth=900;
		var canvasHeight=500;
		var padding=70;		//绘图内容到边框的距离
		var bgColor='#f2f2f2';
		var dataCount=arr.length;
		var origin={x:padding,y:canvasHeight-padding};
		var xEnd={x:canvasWidth-padding,y:canvasHeight-padding};
		var yEnd={x:padding,y:padding};
		var fontSize=14;
		var yPointCount=6;		//y轴坐标点数量
		var yPointSpace=(canvasHeight-2*padding)/yPointCount		//y轴两个坐标点间距


		var canvas=$('#canvas-buy-state')[0];		//转化为DOM对象
		canvas.width=canvasWidth;
		canvas.height=canvasHeight;
		var ctx=canvas.getContext('2d');

		// 绘制背景色
		ctx.fillStyle=bgColor;
		ctx.fillRect(0,0,canvasWidth,canvasHeight);
		// 绘制X轴（带箭头），绘制坐标点
		ctx.beginPath();
		ctx.moveTo(origin.x,origin.y);
		ctx.lineTo(xEnd.x,xEnd.y);
		ctx.lineTo(xEnd.x-10,xEnd.y-7);
		ctx.moveTo(xEnd.x,xEnd.y);
		ctx.lineTo(xEnd.x-10,xEnd.y+7);

		// 绘制x轴坐标点
		var barWidth=(canvasWidth-2*padding)/(dataCount*2+1);		//柱状图宽度
		ctx.fillStyle="#000";
		for(var i=0;i<dataCount;i++){
			var x=(2*i+1)*barWidth+origin.x;
			var y=origin.y;
			ctx.moveTo(x,y);
			ctx.lineTo(x,y-5);

			// 绘制x轴提示文字
			var txt=arr[i].label;
			ctx.fillText(txt,x-5,y+fontSize);
		}

		// 绘制Y轴（带箭头），绘制坐标点
		ctx.moveTo(origin.x,origin.y);
		ctx.lineTo(yEnd.x,yEnd.y);
		ctx.lineTo(yEnd.x+7,yEnd.y+10);
		ctx.moveTo(yEnd.x,yEnd.y);
		ctx.lineTo(yEnd.x-7,yEnd.y+10);

		var maxValue=arr[0].value;
		for(var i=1;i<arr.length;i++){
			(arr[i].value>maxValue)&&(maxValue=arr[i].value);
		}
		var valueSpace=parseInt(maxValue/yPointCount);
		for(var i=0;i<yPointCount-1;i++){
			var x=origin.x;
			var y=origin.y-(i+1)*yPointSpace;
			ctx.moveTo(x,y);
			ctx.lineTo(x+5,y);

			//绘制y轴提示文字
			var txt=(i+1)*valueSpace;
			var w=ctx.measureText(txt).width;		//测量字体的宽度
			ctx.fillText(txt,x-w-3,y+fontSize/2);
		}

		// 绘制统计折线图
		for(var i=0;i<dataCount;i++){
			var value=arr[i].value;			//金额值
			var barHeight=(canvasHeight-padding*2)/maxValue*value;
			var x=(2*i+1)*barWidth+origin.x;
			var y=origin.y-barHeight;
			// 创建折线图
			if(i==0){
				ctx.moveTo(x+barWidth/2,y);
			}else{
				ctx.lineTo(x+barWidth/2,y);
			}

			//绘制柱状图
			ctx.strokeRect(x,y,barWidth,barHeight);
			var g=ctx.createLinearGradient(x,y,x,origin.y);
			g.addColorStop(0,rc());
			g.addColorStop(1,rc());
			ctx.fillStyle=g;
			ctx.fillRect(x,y,barWidth,barHeight);

			// 标识金额
			ctx.fillText(value,x+barWidth/2+7,y-2);
		}

		ctx.stroke();
	})
});

function rc() {
	var r=Math.floor(Math.random()*256);
	var g=Math.floor(Math.random()*256);
	var b=Math.floor(Math.random()*256);
	return 'rgb('+r+','+g+','+b+')';
}
// 模拟出mouseover效果（如果是默认选中项）
// $('[name="record"]').trigger('mouseover');

$('[name="record-FC"]').mouseover(function () {
	$.get('data/buy_state.php',{uname:'qiangdong'},function (arr) {
		//调用FusionCharts
		new FusionCharts({
			type:'column2d',	//图表类型
			renderAt:'record-FC',
			width:'900',
			height:'500',
			dataFormat:'json',		//数据格式
			dataSource:{			//数据源
				data:arr
			}
		}).render();		//渲染图表
	});
});






