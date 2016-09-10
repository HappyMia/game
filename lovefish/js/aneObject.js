//********************************************************************//定义海葵类****************************
	var aneObject = function(){
		this.num = 50;     //海葵的数量
		//start point, controll point , end point
		this.rootx = [];
		this.headx = [];
		this.heady = [];
		this.amp = [];   //振幅
		this.beta = 0;    //sin的角度
	}
	aneObject.prototype.init = function(){
		for (var i = 0; i< this.num; i++){
			this.rootx[i] = (i * 18 + Math.random() * 30).toFixed(2);  //toFixed(2):四舍五入，保留两位小数
			this.headx[i] = this.rootx[i];
			this.heady[i] = (canHei - 200) + Math.random() * 50;
			this.amp[i] = Math.random() * 50 + 100;
		}
	}
	aneObject.prototype.drawAne = function(){
		this.beta += diffframetime * 0.0008;
		var l = Math.sin(this.beta);

		ctx2.save();
		ctx2.globalAlpha = 0.7;
		ctx2.lineWidth = 20;
		ctx2.lineCap = 'round';
		ctx2.strokeStyle = '#3b154e';
		for(var i = 0; i< this.num; i++){
			//beginPath, moveTo,lineTo,lineWidth, strokeStyle, lineCap, stroke;
			var x = this.rootx[i] + l * this.beta;
			ctx2.beginPath();
			ctx2.moveTo(this.rootx[i], canHei);     //起始点
			ctx2.quadraticCurveTo(this.rootx[i], canHei - 80, this.rootx[i], this.heady[i]);  //控制点  和  结束点的x，y
			ctx2.stroke();
		}
		ctx2.restore();
	}
