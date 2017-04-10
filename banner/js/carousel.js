//创建一个闭包，保护变量。
//在前面加一个分号，防止前面引入的js文件没有闭合引起错误，如果闭合了多加一个分号也不会报错。
;(function($){
	//定义一个Carousel类(构造函数)，参数是一个jQuery对象
	var Carousel=function(poster){
		// 用self保存this对象
		var self=this;
		
		// 保存一下单个旋转木马对象。
		this.poster=poster;
		// 保存ul
		this.posterItemMain=poster.find("ul.poster-list");
		// 保存上下切换按钮
		this.prevBtn=poster.find("div.poster-prev-btn");
		this.nextBtn=poster.find("div.poster-next-btn");
		// 所有图片集合（li集合）
		this.posterItems=poster.find("li.poster-item");
		// 如果图片是偶数张，可以把第一张复制加到最后使它变成奇数张
		if(this.posterItems.size()%2==0){
			this.posterItemMain.append(this.posterItems.eq(0).clone());
			// 重新获取this.posterItems
			this.posterItems=this.posterItemMain.children();
		}

		// 保存第一帧。this.posterFirstItem=this.posterItems.eq(0);也可以实现效果
		this.posterFirstItem=this.posterItems.first();
		this.posterLastItem=this.posterItems.last();
		// 在点击时判断上次动画是否完成
		this.rotateFlag=true;

		// 配置默认参数。
		this.setting={
			"width":1000,	//幻灯片的宽度
    		"height":270,	//幻灯片的高度
			"posterWidth":640,	//幻灯片第一帧的宽度
    		"posterHeight":270,	//幻灯片第一帧的宽度
    		"scale":0.9,	//记录显示比例关系
    		"speed":500,	//切换的速度
    		"autoPlay":false,	//是否自动播放
    		"delay":5000,	//自动播放的间隔时间
    		"verticalAlign":"middle"
		};

		// jQuery的扩展对象方法extend()，原对象存在的属性就替换，没有的就添加。
		$.extend(this.setting,this.getSetting());

		// 设置配置参数值
		this.setSettingValue();
		// 设置剩余图片位置
		this.setPosterPos();

		// 单击向右按钮，触发事件
		this.nextBtn.click(function(){
			// 这里的this指向this.nextBtn箭头对象，而this.nextBtn对象没有carouselRotate()方法，
			// 只有Carousel才有carouselRotate()方法，所以这里用this就会发生漂移。
			// 解决方法：在外面用self保存一下this对象。
			// this.carouselRotate();
			if(self.rotateFlag){
				self.rotateFlag=false;
				self.carouselRotate("left");
			}
		});

		// 单击向左按钮，触发事件
		this.prevBtn.click(function(){
			if(self.rotateFlag){
				self.rotateFlag=false;
				self.carouselRotate("right");
			}	
		});

		// 是否开启自动播放
		if(this.setting.autoPlay){
			this.autoPlay();
			this.poster.hover(function(){
				// 此处的this指向this.poster
				// window.clearInterval(this.timer);
				window.clearInterval(self.timer);
			},function(){
				self.autoPlay();
			});
		}
	};
	// 由于构造函数的方法不能共用，所以要在构造函数的原型property对象上定义方法，
	// 该对象的所有属性和方法都会被构造函数的实例继承。
	Carousel.prototype={
		// 自动播放动画
		autoPlay:function(){
			var self=this;
			// 用this.timer保存方便到时候鼠标停在图片上的时候停止自动播放
			this.timer=window.setInterval(function(){
				// 这里的this指向window
				// this.nextBtn.click();所以要在外面暂时保存下来
				self.nextBtn.click();
			},this.setting.delay);
		},

		// 单击向左向右按钮实现旋转
		carouselRotate:function(dir){
			// 保存this对象，避免this漂移
			var _this_=this;
			// 层级关系
			var zIndexArr=[];

			if(dir==="left"){
				this.posterItems.each(function(){
					// 保存单个对象
					var self=$(this),
						// 获取每一帧图片的上一帧图片，如果是第一帧图片，则获取最后一帧图片，达到一个循环
						prev=self.prev().get(0) ? self.prev() : _this_.posterLastItem,
						width=prev.width(),
						height=prev.height(),
						zIndex=prev.css("zIndex"),
						opacity=prev.css("opacity"),
						left=prev.css("left"),
						top=prev.css("top");

					zIndexArr.push(zIndex);
					self.animate({
						width:width,
						height:height,
						// 在这里设置zIndex用户体验不好，先显示层级了其他的才变换到位，所以现在外面用一个数组存放
						// zIndex:zIndex,
						opacity:opacity,
						left:left,
						top:top
					},_this_.setting.speed,function(){
						_this_.rotateFlag=true;
					});
				});

				this.posterItems.each(function(i){
					$(this).css("zIndex",zIndexArr[i]);
				});
			}else if(dir==="right"){
				this.posterItems.each(function(){
					// 保存单个对象
					var self=$(this),
						next=self.next().get(0) ? self.next() : _this_.posterFirstItem,
						width=next.width(),
						height=next.height(),
						zIndex=next.css("zIndex"),
						opacity=next.css("opacity"),
						left=next.css("left"),
						top=next.css("top");

					zIndexArr.push(zIndex);

					self.animate({
						width:width,
						height:height,
						// zIndex:zIndex,
						opacity:opacity,
						left:left,
						top:top
					},_this_.setting.speed,function(){
						_this_.rotateFlag=true;
					});
				});
			}

			this.posterItems.each(function(i){
					$(this).css("zIndex",zIndexArr[i]);
				});
		},

		// 设置剩余广告帧的位置
		setPosterPos:function(){
			// 因为要在rightSlice.each中的function里拿到外面的this对象(整个旋转木马对象)已经变了
			var self=this;
			// 剩余广告帧
			var sliceItems=this.posterItems.slice(1),
			// 左右两边广告帧的个数（用一个变量保存，因为不止一次用到）
				sliceSize=sliceItems.size()/2,
			// 右边的图片帧
				rightSlice=sliceItems.slice(0,sliceSize),
			// 左边图片帧
			    leftSlice=sliceItems.slice(sliceSize),
			// 层级关系（设置z-index的值）
			 	level=Math.floor(this.posterItems.size()/2);



			// 设置右边每一帧图片的位置关系（宽度、高度、top），大小与第一帧的大小成比例
			// 先记下第一帧大小
			var rw=this.setting.posterWidth,
				rh=this.setting.posterHeight,
				// 俩图片之间的间距
				gap=((this.setting.width-this.setting.posterWidth)/2)/level;
				// sl=this.setting.scale;
				
			// 第一帧left值
			var firstLeft=(this.setting.width-this.setting.posterWidth)/2;
			// 右边图片的起点
			var fixOffsetLeft=firstLeft+rw;	

			rightSlice.each(function(i){
				level--;
				rw = rw*self.setting.scale;
				rh = rh*self.setting.scale;

				$(this).css({
					zIndex:level,
					width:rw,
					height:rh,
					opacity:1/(++i),
					left:fixOffsetLeft+i*gap-rw,
					top:self.setVerticalAlign(rh)
				});
			});



			// 设置左边图片的位置关系
			// 以最右边的图片为参考，先拿到最右边图片的宽度和高度
			var lw=rightSlice.last().width(),
				lh=rightSlice.last().height(),
				// 透明度的循环
				oloop=Math.floor(this.posterItems.size()/2);

			leftSlice.each(function(i){
				$(this).css({
					zIndex:i,
					width:lw,
					height:lh,
					opacity:1/oloop,
					left:i*gap,
					top:self.setVerticalAlign(lh)
				});
				lw=lw/self.setting.scale;
				lh=lh/self.setting.scale;
				oloop--;
			});
		},

		// 设置图片的垂直排列对齐
		setVerticalAlign:function(height){
			// 保存配置对象上垂直类型属性
			var verticalType=this.setting.verticalAlign,
				top=0;
			if(verticalType==="middle"){
				top=(this.setting.height-height)/2;
			}else if(verticalType==="top"){
				top=0;
			}else if(verticalType==="bottom"){
				top=this.setting.height-height;
			}else{
				top=(this.setting.height-height)/2;
			}
			return top;
		},

		//设置配置参数值去控制基本的宽度高度。
		setSettingValue:function(){
			this.poster.css({
				width:this.setting.width,
				height:this.setting.height
			});
			this.posterItemMain.css({
				width:this.setting.width,
				height:this.setting.height
			});

			// 计算上下切换按钮的宽度
			var w = (this.setting.width-this.setting.posterWidth)/2;
			// 设置向左按钮的宽高、层级
			this.prevBtn.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.posterItems.size()/2)
			});
			// 设置向右按钮的宽高、层级
			this.nextBtn.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.posterItems.size()/2)
			});
			// 设置第一帧图片的宽高、位置、层级
			this.posterFirstItem.css({
				width:this.setting.posterWidth,
				height:this.setting.posterHeight,
				left:w,
				top:(this.setting.height-this.setting.posterHeight)/2,
				zIndex:Math.floor(this.posterItems.size()/2)
			});
		},
		

		// 获取人工配置参数。
		getSetting:function(){
			var setting=this.poster.attr("data-setting");
			if(setting&&setting!=""){
				// jQuery的parseJSON()方法，将一个对象转换成JSON对象。
				return $.parseJSON(setting);
			}
			else{
				return {};
			}
		}
	};
	// 当前面传过来的参数是一个集合（如果要一个个去new来初始化，代码量会很多），
	// 这个时候可以接收一个集合作为参数在一个循环里初始化。
	Carousel.init=function(posters){
		//这个this指向Carousel
		var _this_=this;
		// posters是一个集合
		posters.each(function(){
			// 此处的this指向集合中的每一个DOM元素，由于构造函数接收的是一个jQuery对象，所以用$()将其转换成jQuery对象。
			new _this_($(this));
		});
	};
	//因为在外面访问不到Carousel，所以将Carousel在window对象上全局注册一下。
	window["Carousel"]=Carousel;
})(jQuery);