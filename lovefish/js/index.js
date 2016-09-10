(function(){
	//var imgUrl = 'http://7xtawy.com1.z0.glb.clouddn.com/tinyheart';
	var imgUrl = 'images/';
	var can1, can2;   //canvas1画布 ,   canvas2画布
	var ctx1, ctx2;   //两个画笔
	var canWid, canHei;  //画布的宽高
	var lastframetime,  diffframetime=0;  // 上一帧动画的时间，两帧时间差：调整物体的运动速度（因为每一帧时间差不一样），保证动画流畅连贯。
	                                        //时间差相同：匀速运动；时间差不同，变速运动
	var aneOb, fruitOb, momOb, babyOb;  //海葵对象 和  果实对象 和 鱼妈妈对象  和小鱼对象
	var scoreOb, waveOb, haloOb;      //和数据对象（计算分值）  和圆圈对象
	var mx, my;    //鼠标的横纵坐标值。
	var dustOb;
	
	var coverPic = new Image();
	var playPic = new Image();
	var pausePic = new Image();
	var bgPic = new Image();
	bgPic.src= imgUrl + 'background.jpg';
	coverPic.src = imgUrl +'cover.png'; //加载封面
	playPic.src = imgUrl +'play.png';   //加载 
	pausePic.src = imgUrl +'pause.png'; //加载 
	var bgAudio,eatFruitAudio,foodBabyAudio,loseAudio;
	var isPlay = false;  //播放标志
	var loseAudioFlag = false;;   //游戏结束音乐标志
	var gameOverFlag = false;
	var handle;
	var str;
	//window.localStorage.removeItem("score")

	// **********************************************************************************全局函数、初始化、判断等*******
	// *****************************************************************************************************************
	window.jzk = {};

	jzk.startgame = function(){
		jzk.init(); 
		bgAudio.loop = true;
			 var playPicW = playPic.width;
			 var playPicH = playPic.height;
        coverPic.onload = function(){ //使用drawImage方法在canvas下绘图，在谷歌浏览器下需要加onload事件
			 ctx2.drawImage(coverPic,0,0,canWid,canHei);  //画封面
			 ctx2.drawImage(playPic,canWid/2-playPicW/2,canHei/2-playPicH/2);	 
			 ctx2.save();
			 ctx2.fillStyle = "#fff";
			 ctx2.font = "20px impact";
			 ctx2.textAlign = "center";
			 ctx2.fillText("1、用鼠标控制鱼妈妈吃海葵喂鱼宝宝",canWid *.5, canHei - 200);
			 ctx2.fillText("2、在鱼宝宝身体变之前喂食鱼宝宝，否则游戏结束",canWid *.5, canHei - 170);
			 ctx2.fillText("3、尽量保证鱼妈妈每次都能吃到一颗蓝色海葵来得到更高的分数！",canWid *.5, canHei - 140);
			 ctx2.fillText("4、你可以在游戏过程中随时点击游戏界面来暂停/开始/或者重新游戏！",canWid *.5, canHei - 110);
			 ctx2.fillText("5、好了，点击界面来开始游戏吧^_^！",canWid *.5, canHei - 80);
			 ctx2.restore();
		}
		
		lastframetime = Date.now();// 上一帧动画的时间， Date.now()：返回1970年 00:00:00 到现在的毫秒数
		addEvent(can1,"click",function(){
		   if(!isPlay){   
			 bgAudio.play();
            jzk.gameLoop();
			isPlay = true;
		   }else if(isPlay && !scoreOb.gameOver){
			   bgAudio.pause();
               cancelAnimationFrame(handle); 
			   ctx2.drawImage(pausePic,canWid/2-playPicW/2,canHei/2-playPicH/2);
               isPlay = false;
		   }else{
			   jzk.init();
			   cancelAnimationFrame(handle);//如果不加这个，前面jzk.gameLoop();停止不了，还会继续绘制。后面else if点击暂停时的cancelAnimationFrame不起作用，画面停不了
			   jzk.gameLoop();
			   bgAudio.play();
			   isPlay = true;
			   loseAudioFlag = false;
			   gameOverFlag = false;
		   }
		});
	}
	jzk.init = function(){
		can1 = document.getElementById('canvas1');
		ctx1 = can1.getContext('2d');  //上面的canvas，参数2D必须写
		can2 = document.getElementById('canvas2');
		ctx2 = can2.getContext('2d');   //下面的canvas
        
		bgAudio = document.getElementById('bgAudio');
		eatFruitAudio = document.getElementById('eatFruitAudio');
		foodBabyAudio = document.getElementById('foodBabyAudio');
	    loseAudio = document.getElementById('loseAudio');
		
		// coverPic.src = imgUrl +'cover.png'; //加载封面
		// playPic.src = imgUrl +'play.png';   //加载 
		// pausePic.src = imgUrl +'pause.png'; //加载 
		
		//绘制文字
		ctx1.fillStyle = '#fff';       //文字的颜色
		ctx1.font = '20px 微软雅黑';
		ctx1.textAlign = 'center';
		
		can1.addEventListener('mousemove', jzk.onMouseMove, false);
		can1.addEventListener('click', jzk.onClick, false);

		canWid = can1.width;     //获取画布的尺寸
		canHei = can1.height;

		mx = canWid * 0.5;
		my = canHei * 0.5;

		aneOb = new aneObject();  //new 一个海葵类
		aneOb.init();  //初始化海葵的属性

		fruitOb = new fruitObject();
		fruitOb.init();

		momOb = new momObject();
		momOb.init();

		babyOb = new babyObject();
		babyOb.init();

		scoreOb = new scoreObject();   //创建的时候已经初始化

		waveOb = new waveObject();
		waveOb.init();

		haloOb = new haloObeject();
		haloOb.init();

		dustOb = new dustObject();
		dustOb.init();
	}
	jzk.gameLoop = function(){   //使用帧绘画，一直在画的东西
		handle = requestAnimFrame(jzk.gameLoop);//返回一个ID
		var now = Date.now();    //1970 00:00:00 到现在的毫秒数
		diffframetime = now - lastframetime;
		lastframetime = now;   //更新上次时间
		//console.log(diffframetime)
		//chrome浏览器的bug，当切换到其他页面的时候，这段时间是不执行的，diffframetime时间变长
		//果实的尺寸和diffframetime成正比，果实长到无限大
		if(diffframetime > 40){
			diffframetime = 40;   
		}

		ctx2.clearRect(0, 0, canWid, canHei);    //清除画布2
		can2App.drawBackgorund();//由于背景的阻挡，画布二不清除也会是正常的，但前面的帧还是没清除
		aneOb.drawAne();  // 画海葵部分
	 
		computeFruit();  //根据果实出现个数再出生果实
		fruitOb.drawFruit();  //画果实部分

		ctx1.clearRect(0, 0, canWid, canHei);    //清除前面一帧的内容，在干净的画布上绘制，ctx1是一个透明的画布，覆盖在第二个画布上
		momOb.drawMom();   //画鱼妈妈
		 
		babyOb.drawBaby();  //画小鱼
			   scoreOb.drawScore();
		if(!scoreOb.gameOver){  //如果游戏没有结束
			jzk.momEatFruit();  //随时判断果实是否被吃掉
			jzk.momFoodBaby();  //判断大鱼喂小鱼
		}else{
			 bgAudio.load();  //重新加载背景音乐
			if(!loseAudioFlag){
			 loseAudioFlag = true;
             loseAudio.play();
           }
	
		   if(!gameOverFlag){
			 gameOverFlag = true;
			  if(!window.localStorage.getItem("score")){
				window.localStorage.setItem("score",scoreOb.score);
				str = "您本轮的成绩为"+scoreOb.score+"分!";
			  }else{
			    var score = window.localStorage.getItem("score");
				if(scoreOb.score > +score){
					window.localStorage.setItem("score",scoreOb.score);
					 str = "您本轮的成绩为"+scoreOb.score+"分，恭喜你创造新的记录!";
				}else if(scoreOb.score < (+score-2)){  //和最高成绩之差大于2
					 str = "您的最高成绩是"+score+"，请再接再厉！";
				}else{                                 //和最高成绩相差2分之内
					 str = "啊呀，差一点就破记录啦，加油啊！"
				}
			  }
			}
			 ctx1.save();
			 ctx1.font = 'bold 30px impact';
			 ctx1.shadowBlur = 30;
		     ctx1.shadowColor = "white";
			 ctx1.fillStyle = "rgba(255, 255, 255, 0.6)";
			 ctx1.strokeStyle="#f90";
		     ctx1.fillText(str, canWid * 0.5, canHei * 0.5 + 80);
			 ctx1.restore();
		}

		waveOb.drawWave();
		haloOb.drawHalo();
		dustOb.drawDust();
	}
	jzk.onMouseMove = function(e){     //鼠标移动事件，layerX是FF浏览器特有的。
		if(!scoreOb.gameOver){  //如果游戏没有结束,e.offsetX,鼠标相对于内容区域左上角的坐标
			if(e.offsetX || e.layerX){
				mx = e.offsetX == undefined ? e.layerX : e.offsetX;
				my = e.offsetY == undefined ? e.layerY : e.offsetY;
			}
		}
	}
/* 	jzk.onClick = function(){
		if(scoreOb.gameOver){   //如果游戏为结束状态
			scoreOb.gameOver = false;
			// aneOb.init();
			fruitOb.init();
			momOb.init();
			babyOb.init();
			scoreOb.init();
		}else {
			//可以扩展点击停止 
		}
	} */
	jzk.momEatFruit = function(){     //判断果实和大鱼之间的距离，小于30说明被吃掉
		for(var i = 0;i < fruitOb.num; i++ ){
			if(fruitOb.alive[i] && fruitOb.grow[i]){  //果实是活的并且果实已经长大
				var len = calLength2(fruitOb.x[i], fruitOb.y[i], momOb.x, momOb.y);
				if(len < 30){
					fruitOb.dead(i);    //如果距离小于30，则被吃掉
                    eatFruitAudio.play();
					waveOb.born(i);     //吃掉的时候，产生圆圈
					scoreOb.fruitNum ++;
					momOb.momBodyIndex = momOb.momBodyIndex == 7 ? momOb.momBodyIndex : (momOb.momBodyIndex + 1);//身体颜色加深，直到最深
					if(fruitOb.type[i] == 'blue'){
						scoreOb.doubleNum ++;
					}
				}
			}
		}
	}
	jzk.momFoodBaby = function(){    //判断大鱼和小鱼之间的距离，小于30，小鱼的颜色变深
		if(scoreOb.fruitNum > 0){
			var len = calLength2(momOb.x, momOb.y, babyOb.x, babyOb.y);
			if(len < 30){   //距离小于30，而且大鱼吃到了果实，才能喂小鱼
				haloOb.born();
				foodBabyAudio.play();
				momOb.momBodyIndex = 0;     //大鱼体力变0
				var num = scoreOb.doubleNum * scoreOb.fruitNum;
				var index = babyOb.babyBodyIndex - num;
				if(index < 0){
					index = 0;  //如果下标小于0， 则等于0
				}

				var strength = scoreOb.strength + (index/2).toFixed(0);
				if(strength > 10){
					strength = 10;
				}
				scoreOb.strength = strength;
				babyOb.babyBodyIndex = index;  //小鱼身体图片下标减小，身体变红
				scoreOb.computeScore();   //计算总分,
				 
			}
		}
	}


	// *******************************************************画布2上绘制东西  （背景，海葵，果实）**********************
	// ******************************************************************************************************************
	window.can2App = {};

	    can2App.drawBackgorund = function(){
		ctx2.drawImage(bgPic,0,0,canWid,canHei);//绘制背景
	}


	//********************************************************************//定义海葵类****************************
	var aneObject = function(){
		this.num = 50;     //海葵的数量
		//start point, controll point , end point
		this.rootX = [];
		this.headX = [];
		this.headY = [];
		this.amp = [];   //振幅
		this.beta = 0;    //sin的角度
	}
	aneObject.prototype.init = function(){
		for (var i = 0; i< this.num; i++){
		//	this.rootX[i] = (i * 18 + Math.random() * 30);//.toFixed(2);  //toFixed(2):四舍五入，保留两位小数；注意：返回类型是String
			this.rootX[i] = i * 16 +Math.random() * 30; //30
			this.headX[i] = this.rootX[i];
			this.headY[i] = (canHei - 200) + Math.random() * 50;
			this.amp[i] = Math.random() * 50 + 50;
		}
	}
	aneObject.prototype.drawAne = function(){
		this.beta += diffframetime * 0.0008;
		var l = Math.sin(this.beta);

		ctx2.save();    //保存当前上下文状态
		ctx2.globalAlpha = 0.4; //设置透明度
		ctx2.lineWidth = 20;   //线粗20px
		ctx2.lineCap = 'round'; //末端为圆形，属性有butt，square，round
		ctx2.shadowBlur = 1;    //阴影宽度
        ctx2.shadowColor = "#9b154e";   //阴影颜色
		ctx2.strokeStyle = '#3b154e';   //填充颜色
		for(var i = 0; i< this.num; i++){
			//beginPath, moveTo,lineTo,lineWidth, strokeStyle, lineCap, stroke;
			ctx2.beginPath();
			ctx2.moveTo(this.rootX[i], canHei);     //起始点
			this.headX[i] = this.rootX[i] + l * this.amp[i];
			ctx2.quadraticCurveTo(this.rootX[i], canHei - 80, this.headX[i], this.headY[i]);  //二次样条曲线：控制点和结束点的坐标
			ctx2.stroke();
		}
		ctx2.restore();  //恢复最后一次被保存的状态
	}

	//********************************************************************//定义果实类****************************
	var fruitObject = function(){
		this.num = 30;
		this.x = [];  //果实生长的坐标
		this.y = [];
		this.size = [];   //果实大小（直径）
		this.type = [];   //果实的类型
		this.speed = [];  //果实漂浮速度
		this.grow = [];   //果实是否长大
		this.alive = [];  //bool，是否活着
		this.orange = new Image();
		this.blue = new Image();
		this.aneNO = [];   //保存海葵的坐标
	}
	fruitObject.prototype.init = function(){
		this.orange.src = imgUrl + 'fruit.png'; //加载不同的图片资源
		this.blue.src = imgUrl + 'blue.png';
		for(var i = 0; i< this.num; i++){
			this.x[i] = this.y[i] = 0;
			this.speed[i] = Math.random() * 0.015 + 0.005;   //[0.005  ,  0.02)  //果实成长和向上飘得速度
			this.alive[i] = false;   //初始值都为false
			this.grow[i] = false;    //初始为“未长大”;
			this.type[i]  = "";
			this.aneNO[i] = 0;        
		}
	}
	fruitObject.prototype.drawFruit = function(){
		for(var i =0;i< this.num; i++){
			if(this.alive[i]){
				//find an ane, grow, fly up...首先要找到一个生长的位置
				if(this.size[i] <= 16){   //生长状态
				    var NO = this.aneNO[i];
					this.x[i] = aneOb.headX[NO]; //果实生长的横坐标，就是海葵的顶部
                    this.y[i] = aneOb.headY[NO]; //果实生长的纵坐标
					this.grow[i] = false;
					this.size[i] += this.speed[i] * diffframetime * 0.8;//果实的尺寸和两帧之间的时间差成正比
				}else{   //已经长大,向上漂浮，本质就是y坐标逐渐减小
					this.grow[i] = true;
					this.y[i] -= this.speed[i] * 5 * diffframetime;
				}
				var pic = this.orange;
				if(this.type[i] == 'blue')   pic = this.blue;
                //绘制图像，参数：image，x,y,width,height;图片对象，图片左上角位置，图片尺寸
				ctx2.drawImage(pic, this.x[i] - this.size[i] * 0.5, this.y[i] - this.size[i] * 0.5, this.size[i], this.size[i]);
				if(this.y[i] < 8){ // 8是果实的半径
					this.alive[i] = false;
				}
			}
		}
	}
	fruitObject.prototype.born = function(i){   //找到一个出生点
		this.aneNO[i] = Math.floor(Math.random() * aneOb.num); //随机确定在哪个海葵上出生，[0,49]，
		//但是有可能多个果实在一个海葵上重叠，可以给海葵一个状态，判断下如果海葵被占用就重新找一个海葵。
		this.size[i] = 0;        //果实的直径
		this.alive[i] = true;    
		var flag = Math.random(); //确定是蓝色果实还是橙色果实，蓝色概率为0.2，橙色概率为0.8
		if(flag < 0.2){
			this.type[i] = "blue";
		}else{
			this.type[i] = "orange";
		}
	}
	fruitObject.prototype.dead = function(i){
		this.alive[i] = false;
	}
	function computeFruit() {           //计算屏幕上的果实数量
		var count = 0;  
		for(var i = 0; i < fruitOb.num; i++){
			if(fruitOb.alive[i])  count ++;
			if(count >= 15) return;
		}
		//if(count < 15){         //如果屏幕上的果实数量小于15，则出生一个果实
			bornFruit();		//出生一个果实
			//alert("a")
			return false;
		//}
	}
	function bornFruit() {     //循环30个果实，如果状态为false，则让它出生
		for(var i = 0;i< fruitOb.num; i++){  //想想这个循环能不能改进？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？
			if(!fruitOb.alive[i]){
				fruitOb.born(i);
				return false;
			}
		}
	}


	//***************************************画布1上绘制东西****************
	// **********************************************************************************************************************
	window.can1App = {};//没用到？？？？？？？？？？？？？？

	//********************************************************************//定义鱼妈妈类*********************
	var momObject = function(){
		this.x = 0;
		this.y = 0;
		this.angle;     //大鱼的角度
		this.momTailArr = [];  //存放大鱼尾巴地址
		this.momTailTimer = 0; //大鱼尾巴摆动频率
		this.momTailIndex = 0; 

		this.momEyeArr =[];    //存放大鱼眼睛地址
		this.momEyeTimer = 0;  //大鱼眨眼频率
		this.momEyeIndex = 0;
		this.momEyeInterval = 1000;  //鼓眼和眨眼的存在时间

		this.momOrangeArr = [];   //大鱼的橙色身体数组
		this.momBlueArr = [];     //蓝色身体数组
		this.momBodyIndex = 0;
	}
	momObject.prototype.init = function(){
		this.x = canWid * 0.5;      //大于初始化在画布正中间
		this.y = canHei * 0.5;
		this.angle = 0;

		for(var i = 0;i< 8; i++){   //加载大鱼尾巴
			this.momTailArr[i] = new Image();
			this.momTailArr[i].src = imgUrl + 'bigTail'+ i +'.png';
		}
		for(var i = 0;i< 2; i++){   //大加载鱼眼睛
			this.momEyeArr[i] = new Image();
			this.momEyeArr[i].src = imgUrl + 'bigEye'+ i +'.png';
		}
		for(var i = 0;i< 8; i++){   
			this.momOrangeArr[i] = new Image();         //大鱼橙色身体
			this.momOrangeArr[i].src = imgUrl + 'bigSwim'+ i +'.png';
			this.momBlueArr[i] = new Image();           //大鱼蓝色身体
			this.momBlueArr[i].src = imgUrl + 'bigSwimBlue'+ i +'.png';
		}
	}
	momObject.prototype.drawMom = function(){
		//lerp x,y   让大鱼的坐标值倾向于鼠标位置，然后绘制大鱼
		this.x = lerpDistance(mx, this.x, 0.06);//当前位置是this.x,mx是目标位置，就是鼠标位置，以0.96的比例趋近于mx
		this.y = lerpDistance(my, this.y, 0.06);
		//lerp angle    让大鱼的角度倾向于鼠标的角度
		//计算大于与鼠标之间的角度，用坐标差来计算，大雨的角度要趋向于这个角度，通过旋转画布来实现
		var deltaX = mx - this.x;  //横坐标差
		var deltaY = my - this.y;  //纵坐标差
		var beta = Math.atan2(deltaY, deltaX) + Math.PI;    //目标角度，返回值是[-pi,pi]之间
		this.angle = lerpAngle(beta, this.angle, 0.5);    //获得每一次旋转的角度

		this.momTailTimer += diffframetime;
		if(this.momTailTimer > 50){
			this.momTailIndex = (this.momTailIndex + 1) % 8;
			this.momTailTimer %= 50;
		}

		this.momEyeTimer += diffframetime;
		if(this.momEyeTimer > this.momEyeInterval){
			this.momEyeIndex = (this.momEyeIndex + 1) % 2;
			this.momEyeTimer %= this.momEyeInterval;

			if(this.momEyeIndex == 0){
				this.momEyeInterval = Math.random() * 1500 + 1500;
			}else{
				this.momEyeInterval = 200;
			}
		}

		ctx1.save();     //保存之前的画布
		ctx1.translate(this.x, this.y);      //把原点变成(this.x , this.y);开始是将坐标原点设置成画布中间
		ctx1.rotate(this.angle);             //旋转画布，让大鱼转起来
       //先画尾巴，再画身体，最后画眼睛，先画的在下面，最后画的在上面，眼睛在最上面
		var momTailImage = this.momTailArr[this.momTailIndex];  //加载指定图片
		ctx1.drawImage(momTailImage, -momTailImage.width * 0.5 + 30, -momTailImage.height * 0.5);//大鱼尾巴
		 

		var momBodyImage;
		if(scoreOb.doubleNum != 1){   //说明大鱼吃到了蓝色果实，身体变蓝色
			momBodyImage = this.momBlueArr[this.momBodyIndex];
		}else{
			momBodyImage = this.momOrangeArr[this.momBodyIndex];
		}
		ctx1.drawImage(momBodyImage, -momBodyImage.width * 0.5, -momBodyImage.height * 0.5);

		var momEyeImage = this.momEyeArr[this.momEyeIndex];
		ctx1.drawImage(momEyeImage, -momEyeImage.width * 0.5, -momEyeImage.height * 0.5);
		ctx1.restore();   //操作完后返回到之前的画布
	}


	//********************************************************************//定义小鱼类***************************
	var babyObject = function(){
		this.x = 0;
		this.y = 0;
		this.angle;     //小鱼的角度
		this.babyTailArr = [];    //尾巴图片数组
		this.babyTailTimer = 0;  //计时器
		this.babyTailIndex = 0;  //尾巴图片数组的下标

		this.babyEyeArr = [];
		this.babyEyeTimer = 0;
		this.babyEyeIndex = 0;
		this.babyEyeInterval = 1000;  //初始间隔时间为1秒

		this.babyBodyArr = [];
		this.babyBodyTimer = 0;
		this.babyBodyIndex = 0;
	}
	babyObject.prototype.init = function(){
		this.x = canWid * 0.5 -50;
		this.y = canHei * 0.5 + 50;
		//this.babyBodyIndex = 0;
		this.angle = 0;
		for(var i = 0;i < 8;i++){    //初始化小鱼的尾巴图片数组
			this.babyTailArr[i] = new Image();
			this.babyTailArr[i].src = imgUrl + 'babyTail'+ i +'.png';
		}
		for(var i = 0;i < 2;i++){   //初始化小鱼的眼睛图片数组
			this.babyEyeArr[i] = new Image();
			this.babyEyeArr[i].src = imgUrl + 'babyEye'+ i +'.png';
		}
		for(var i = 0;i < 20;i++){   //初始化小鱼的身体图片数组
			this.babyBodyArr[i] = new Image();
			this.babyBodyArr[i].src = imgUrl + 'babyFade'+ i +'.png';
		}
	}
	babyObject.prototype.drawBaby = function(){
		//lerp x , y   让小鱼坐标倾向于大鱼坐标。
		if(!scoreOb.gameOver){
			 this.x = lerpDistance(momOb.x, this.x, 0.02); //原:0.98		
			 this.y = lerpDistance(momOb.y, this.y, 0.01); //原:0.99
		}else{
			 this.x = lerpDistance(momOb.x, this.x, 0.02); //小鱼死掉，沉入海底 
			 this.y = lerpDistance(580, this.y, 0.1);
			 this.angle = lerpAngle(Math.PI, this.angle, 0.1); 
		}

		//lerpangle， 让小鱼的角度倾向于大鱼的角度，   然后绘制小鱼
		var deltaX = momOb.x - this.x;
		var deltaY = momOb.y - this.y;
		var beta = Math.atan2(deltaY, deltaX) + Math.PI;
		this.angle = lerpAngle(beta, this.angle, 0.6);    //获得每一次倾向于大鱼旋转的角度

		this.babyTailTimer += diffframetime;
		if(this.babyTailTimer > 50){
			this.babyTailIndex = (this.babyTailIndex + 1) % 8;   //获得尾巴图片数组下标
			this.babyTailTimer %= 50;
		}

		this.babyEyeTimer += diffframetime;
		if(this.babyEyeTimer > this.babyEyeInterval){   //如果计数器大于时间间隔,数组下标加1
			this.babyEyeIndex = (this.babyEyeIndex + 1) % 2;
			this.babyEyeTimer %= this.babyEyeInterval;

			if(this.babyEyeIndex == 0){       //如果下一帧是闭眼睛状态，时间间隔为2－3秒
				this.babyEyeInterval = Math.random() * 1500 + 1500;
			}else{
				this.babyEyeInterval = 200;
			}
		}

		this.babyBodyTimer += diffframetime;
		if(this.babyBodyTimer > 550){
			this.babyBodyIndex += 1;
			this.babyBodyTimer %= 550;
			scoreOb.strength = ((20 - this.babyBodyIndex)/2).toFixed(0);

			if(this.babyBodyIndex > 19){   //如果身体变成白色，game over；
				this.babyBodyIndex = 19;
				//if(!scoreOb.gameOver)
				scoreOb.gameOver = true;
				can1.style.cursor = "pointer";
			}
		}

		ctx1.save();     //保存之前的画布
		ctx1.translate(this.x, this.y);    //坐标原点在小鱼的当前位置
		ctx1.rotate(this.angle);  //旋转画布

		//先画尾巴，再画身体，最后花眼睛
		var babyTailImage = this.babyTailArr[this.babyTailIndex];//加载指定的图片
		ctx1.drawImage(babyTailImage, -babyTailImage.width * 0.5 + 24, -babyTailImage.height * 0.5);

		var babyBodyImage = this.babyBodyArr[this.babyBodyIndex];
		ctx1.drawImage(babyBodyImage, -babyBodyImage.width * 0.5, -babyBodyImage.height * 0.5);

		var babyEyeImage = this.babyEyeArr[this.babyEyeIndex];
		ctx1.drawImage(babyEyeImage, -babyEyeImage.width * 0.5, -babyEyeImage.height * 0.5);

		ctx1.restore();   //操作完后返回到之前的画布
	}


	//********************************************************************//定义数据类***************************
	var scoreObject = function(){
		this.fruitNum = 0;       //大鱼吃到的果实数量
		this.doubleNum = 1;       //计算分数的倍数
		this.score = 0;
		this.strength = 10;
		this.alpha = 0;
		this.gameOver = false;
	}
	scoreObject.prototype.init = function(){
		this.fruitNum = 0;       //大鱼吃到的果实数量
		this.doubleNum = 1;       //计算分数的倍数
		this.score = 0;
	}
	scoreObject.prototype.drawScore = function(){
		ctx1.fillText("num: " + this.fruitNum, canWid * 0.5, canHei-30);
		ctx1.fillText("double: " + this.doubleNum, canWid * 0.5, canHei-70);

		ctx1.save();
		ctx1.font = '30px verdana';
		ctx1.fillText("SCORE: " + this.score, canWid * 0.5, 50);
		ctx1.font = '20px verdana';
		ctx1.fillText("strength: ", 650, 45);
		if(scoreOb.strength <= 3){
			ctx1.fillStyle = "red";
		}
		ctx1.fillText(scoreOb.strength, 710, 45);
        
		if(scoreOb.gameOver){
			this.alpha += diffframetime * 0.0005;
			if(this.alpha > 1){
				this.alpha = 1;
			}
			ctx1.font = '40px verdana';
			ctx1.shadowBlur = 10;
			ctx1.shadowColor = "white";
			ctx1.fillStyle = "rgba(255, 255, 255, "+ this.alpha +")";
			ctx1.fillText("GAME OVER", canWid * 0.5, canHei * 0.5 - 25);
			ctx1.save();
			ctx1.font = '25px verdana';
			ctx1.fillText("CLICK TO RESTART", canWid * 0.5, canHei * 0.5 + 25);
			ctx1.restore();

		}
		ctx1.restore();
	}
	scoreObject.prototype.computeScore = function(){
		scoreOb.score += scoreOb.fruitNum * scoreOb.doubleNum;
		this.fruitNum = 0;
		this.doubleNum = 1;
	}


	//********************************************************************//大鱼吃果实波浪类*************************
	var waveObject = function(){
		this.num = 10;
		this.x = [];
		this.y = [];
		this.r = [];   //半径
		this.status = [];   //当前圆圈的使用状态
	}
	waveObject.prototype.init = function(){
		for(var i = 0;i< this.num;i++){
			this.x[i] = canWid * 0.5;
			this.y[i] = canHei * 0.5;
			this.status[i] = false;    //初始化圆圈未被使用
			this.r[i] = 0;
		}
	}
	waveObject.prototype.drawWave = function(){    //绘制一个圆圈
		ctx1.save();
		ctx1.lineWidth = 3;
		for(var i = 0;i< this.num; i++){
			if(this.status[i]){     //如果圆圈是使用状态，则绘制圆圈
				this.r[i] += diffframetime * 0.04;
				if(this.r[i] > 60){
					this.status[i] = false;
					return false;
				}
				var alpha = 1 - this.r[i] / 60;

				ctx1.strokeStyle = "rgba(255, 255, 255, "+ alpha +")";
				ctx1.beginPath();
				ctx1.arc(this.x[i], this.y[i], this.r[i], 0, 2 * Math.PI);   //画圆，
				ctx1.stroke();
			}
		}
		ctx1.restore();
	}
	waveObject.prototype.born = function(index){     //出生一个圆圈。
		for(var i = 0; i< this.num; i++){
			if(!this.status[i]){
				this.status[i] = true;   //把圆圈状态设为使用状态
				this.x[i] = fruitOb.x[index];
				this.y[i] = fruitOb.y[index];
				this.r[i] = 10;
				return false;   //找到一个未使用的圆圈，就结束。
			}
		}
	}


	//********************************************************************//大鱼喂小鱼光环类*************************
	var haloObeject = function(){
		this.num = 5;
		this.x = [];
		this.y = [];
		this.r = [];   //半径
		this.status = [];   //当前光环的使用状态
	}
	haloObeject.prototype.init = function(){
		for(var i = 0;i< this.num;i++){
			this.x[i] = canWid * 0.5;
			this.y[i] = canHei * 0.5;
			this.status[i] = false;    //初始化光环未被使用
			this.r[i] = 0;
		}
	}
	haloObeject.prototype.drawHalo = function(){
		ctx1.save();
		ctx1.lineWidth = 4;
		for(var i = 0;i< this.num; i++){
			if(this.status[i]){     //如果光环是使用状态，则绘制光环
				this.r[i] += diffframetime * 0.08;
				if(this.r[i] > 100){
					this.status[i] = false;
					return false;
				}
				var alpha = 1 - this.r[i] / 100;

				ctx1.strokeStyle = "rgba(203, 91, 0, "+ alpha +")";
				ctx1.beginPath();
				ctx1.arc(this.x[i], this.y[i], this.r[i], 0, 2 * Math.PI);   //画圆，
				ctx1.stroke();
			}
		}
		ctx1.restore();
	}
	haloObeject.prototype.born = function(){
		for(var i = 0; i< this.num; i++){
			if(!this.status[i]){
				this.status[i] = true;   //把光环状态设为使用状态
				this.x[i] = babyOb.x;   //光环的位置是小鱼的位置。
				this.y[i] = babyOb.y;
				this.r[i] = 10;
				return false;   //找到一个未使用的光环，就结束。
			}
		}
	}
	var dustObject = function(){
		this.num = 30;
		this.dustPic = [];
		this.x = [];
		this.y = [];
		this.amp = [];
		this.index = [];
		this.beta = 0;
	}
	dustObject.prototype.init = function(){
		for(var i =0; i< 7; i++){
			this.dustPic[i] = new Image();
			this.dustPic[i].src = imgUrl + 'dust'+ i +'.png';
		}
		for(var i = 0;i< this.num; i++){
			this.x[i] = Math.random() * canWid;
			this.y[i] = Math.random() * canHei;
			this.amp = 20 + Math.random() + 15;  //摆动的幅度？？？？？？？？？？？？？？？
			this.index[i] = Math.floor(Math.random() * 7);

		}
	}
	dustObject.prototype.drawDust = function(){
		// console.log(this.dustPic[0]);
		for(var i = 0;i< this.num; i++){
			var index = this.index[i];
			ctx1.drawImage(this.dustPic[index], this.x, this.y);
		}
	}
	jzk.startgame();
	
	function addEvent(element,type,handler){
		if(element.addEventListener){
			element.addEventListener(type,handler,false);
		}else if(element.attachEvent){
			element.attachEvent("on"+type,handler);
		}else{
			element["on"+type] =handler;
		}
	}
})();
