var lpomprojectplantree = function() {
	this.iconPath = "LEAP/LPOMModule/LPOMImg/newImg/folder.png";
	this.treeEl = null;
	this.currentItem = null;// 当前节点信息
	this.itemOperateForm = null;// 节点新增/修改表单
	this.pageLoad = function() {
		this.treeEl = this.ut("treeEl").element;
		if (!this.treeEl) {
			return;
		}

		this.addEvent(this.treeEl, "itemInit", this.tree_itemInit);
		this.addEvent(this.treeEl, "selectedItemChange", this.searchPlan);
		this.addEvent(this.getUT("imgsearch"),"click",this.searchNameOrPlan);
		if(this.getParentModule().name != "lpomindex"){
			this.tree_initTree();
		}else{
			this.initSearchNameOrPlan();
		}
	}
	
	/**
	 * 搜索任务或项目
	 */
	this.searchNameOrPlan = function(arg){
	
		var projectname =  this.md("projectname").getValue();
		
		this.tree_initTree(projectname);
	}
	
	/**
	 * 搜索任务或项目(排除已结束的项目)
	 */
	this.initSearchNameOrPlan = function(arg){
		var sp = new SearchParameters();
		var userinfo = LEAP.getUserInfo();
		sp.add("username",LEAP.getUserInfo().fullName);
		sp.add("orgid",LEAP.getUserInfo().orgid);
		sp.add("orgsyscode",LEAP.getUserInfo().orgsyscode);
		var res = LEAP.request("lpom_getUserDoingPro",{sp:sp});
		this.requset = res;
		if(!res){
			LEAP.messagebox.alert("查询结果为空",2,"消息提示"); 
			return;
		}
		LEAP.messagebox.alert("正在查询,请稍后!",1,"消息提示");
		res = LEAP.convertResult(res);
		this.itemsRoot = [];
		this.currentProjectIndex = 0;
		for(var int=0;int<res.length;int++){
			// search current's Project Index
			if(res[int].currentprojectid === res[int].id)
				this.currentProjectIndex = int;
			var itemInfo = {
				itemID 		: res[int].id,// 当前节点id
				itemname 	: res[int].projectname,// 当前节点id
				projectid 	: res[int].id,// 当前节点项目id
				rolename    : res[int].codevalue,
				projectname : res[int].projectname,
				projecttype : res[int].projecttype,
				syscode		: res[int].syscode// 当前节点项目名称
			}
			this.itemsRoot[int] = {
				tip : res[int].projectname,
				text : res[int].projectname,// 当前节点名称
				value : JSON.stringify(itemInfo),
				value2 : "project",
				icon : this.iconPath,
				hasChild : true
			};
			LEAP.tree.addItems(this.treeEl, null, this.itemsRoot);
			LEAP.tree.bindData(this.treeEl, null, this.itemsRoot, null, {
				text : "text",
				value : "value",
				value2 : "value2",
				value3 : "value3"
			}, function(data) {
				data.hasChild = (data.hasChild);
			});
		}
// // 绑定节点
// LEAP.tree.addItems(this.treeEl, null, this.itemsRoot);
// // 绑定数据
// LEAP.tree.bindData(this.treeEl, null, this.itemsRoot, null, {
// text : "text",
// value : "value",
// value2 : "value2",
// value3 : "value3"
// }, function(data) {
// data.hasChild = (data.hasChild);
// });

		
		// --------------------------------------初始化各项目下的计划------------------------------------------------------------
			this.initSpecialItem(this.itemsRoot[this.currentProjectIndex].value);
	}
	
	/**
	 * 初始化树
	 */
	this.tree_initTree = function(searchPar) {
		// -------------------------------------------初始化项目-------------------------------------------
		var flag;
		if(this.getParentModule().name == "lpomindex"){
			flag = true;
		}else{
			flag = false;
		}
		if(!searchPar){
			searchPar = null;
		}
		var req = this.request("lpom_searchTreeFirstLevel2",{ bean : 
			{
				orgid : this.getUserInfo().orgid,
// roles :this.getUserInfo().roles,
				userid : this.getUserInfo().userid,
				projectname : searchPar,
				flag : flag
			}
		});
		if(req == null)
		{
			LEAP.messagebox.alert("查询结果为空",2,"消息提示"); 
			// this.ut("title").setValue("暂无项目");
			return false;
		} else{
			LEAP.messagebox.alert("正在查询,请稍后!",1,"消息提示");
		}
		
		
	
		this.itemsRoot = [];
		this.currentProjectIndex = 0;
		for ( var int = 0; int < req.length; int++) {
			
			// search current's Project Index
				if(req[int].currentprojectid === req[int].id)
					this.currentProjectIndex = int;
			
			
			var itemInfo = {
				itemID 		: req[int].id,// 当前节点id
				itemname 	: req[int].projectname,// 当前节点id
				projectid 	: req[int].id,// 当前节点项目id
				projectname : req[int].projectname,
				projecttype : req[int].projecttype,
				syscode		: req[int].syscode
				
			// 当前节点项目名称
			}
			this.itemsRoot[int] = {
				tip : req[int].projectname,
				text : req[int].projectname,// 当前节点名称
				value : JSON.stringify(itemInfo),
				value2 : "project",
				icon : this.iconPath,
				hasChild : true
			};
		}
		
		// 绑定节点
		LEAP.tree.addItems(this.treeEl, null, this.itemsRoot);
		// 绑定数据
		LEAP.tree.bindData(this.treeEl, null, this.itemsRoot, null, {
			text : "text",
			value : "value",
			value2 : "value2",
			value3 : "value3"
		}, function(data) {
			data.hasChild = (data.hasChild);
		});

		
		// --------------------------------------初始化各项目下的计划------------------------------------------------------------
			this.initSpecialItem(this.itemsRoot[this.currentProjectIndex].value);
	}

	/**
	 * 初始化特定的节点
	 */
	this.initSpecialItem = function(itemValue){
		
		var temp = {};
			temp.value  = itemValue;
		
		this.bindChildItem(temp);
		LEAP.tree.setSelectedItem(this.treeEl, LEAP.tree.getItemByValue(this.treeEl, temp.value));
		
	}
	/**
	 * 初始化特定的节点(排除已结束的项目)
	 */
	this.initSpecialItemWithoutFinished = function(itemValue){
		
		var temp = {};
			temp.value  = itemValue;
		
		this.bindChildItemWithoutFinished(temp);
		LEAP.tree.setSelectedItem(this.treeEl, LEAP.tree.getItemByValue(this.treeEl, temp.value));
		
	}
	
	/**
	 * 节点点击事件
	 */
	this.searchPlan = function(arg) {
	
		this.currentItem = arg.arg2;
		var item = JSON.parse(this.currentItem.value);// 当前节点信息
		if(item.projectid){
			this.md("currPID").setValue(item.projectid);
		}
		
		// 隐藏计划新增表单
		if(this.itemOperateForm)
			this.itemOperateForm.module.hideForm();
		
		if(this.movemodule)
			this.movemodule.hide();

	}
	
	
	this.verifyRoleOfProjectManager = function(projectid){
		var sp = new SearchParameters();
		sp.setName("lpompromember");
		sp.addParameter("projectid",projectid,11);
//		sp.addParameter("userid",this.getUserInfo().userid,11);
		sp.addParameter("rolename",2,11);
		sp.addParameter("mainrole",1,11);
		sp.pageNum=1;
		sp.pageSize=999;
		var req = this.request("beanSearch",{sp : sp});
		return req;
	}
	
	this.styleOfOperationButton = function(state)
	{
		var parentItem = LEAP.tree.getParent(this.currentItem.item);// 获取父元素
		
		if(!state){
			
			// 自己不是项目经理
			this.st('INPUT_a439').element.style.display = "none";// 新增
			this.st('INPUT_8e92').element.style.display = "none";// 删除
			this.st('INPUT_8e12').element.style.display = "none";// 修改
			this.st('INPUT_1213').element.style.display = "none";// 移动
			
			if(typeof parentItem === 'undefined'){// 顶级节点
				this.st('INPUT_4545').element.style.display = "none";// 查看
			}else{
				this.st('INPUT_4545').element.style.display = "block";// 查看
			}
			
		}else{
			// 自己是项目经理
			
			this.st('INPUT_a439').element.style.display = "block";// 新增
			this.st('INPUT_4545').element.style.display = "none";// 查看
			
			if(typeof parentItem === 'undefined'){// 顶级结点
				
				this.st('INPUT_8e92').element.style.display = "none";// 删除
				this.st('INPUT_8e12').element.style.display = "none";// 修改
				this.st('INPUT_1213').element.style.display = "none";// 移动
				
			}else{
				
				this.st('INPUT_8e92').element.style.display = "block" ;// 删除
				this.st('INPUT_8e12').element.style.display = "block";// 修改
				this.st('INPUT_1213').element.style.display = "block";// 移动
				
			}
		}
	}
	
	/**
	 * 查看节点
	 */
	this.viewItem = function(arg){
		
		if (this.itemOperateForm === null) {
			this.itemOperateForm = this.loadForm("lpomprojectplaninfo");
		} else {
			this.itemOperateForm.module.clearPageData();
			LEAP.form.show(this.itemOperateForm.form);
		}
		this.itemOperateForm.module.setPageData(this.currentItem,"view");
	}
	
	/**
	 * 新增节点
	 */
	this.insertItem = function(arg) {
		if (this.currentItem == null) {
			alert("请选择节点!");
			return;
		}
		var member = this.verifyRoleOfProjectManager(JSON.parse(this.currentItem.value).projectid);
		var userid = this.getUserInfo().userid;
		if(typeof this.currentItem == "object"){
			if(member){
				var memid =  member.result[0].userid;
				var name = member.result[0].username;
				if(memid && !(memid == userid)){
					var html = "只有主项目经理（"+name+"）才有权执行该操作";
					alert(html);
					return;
				}
			}else{
				alert("只有主项目经理才有权执行该操作");
				return;
			}
		}else{
			alert("该项目未有主经理，请联系管理员");
			return;
		}
		if (this.itemOperateForm === null) {
			this.itemOperateForm = this.loadForm("lpomprojectplaninfo");
		} else {
			this.itemOperateForm.module.clearPageData();
			LEAP.form.show(this.itemOperateForm.form);
		}
		this.itemOperateForm.module.setPageData(this.currentItem,"insert");
	}

	/**
	 * 修改节点
	 */
	this.modifyItem = function(arg) {

		if (this.currentItem == null) {
			alert("请选择节点!");
			return;
		}
		
		// 判断是否为项目节点
		var itemObj = JSON.parse(this.currentItem.value);
		if(itemObj.itemname === itemObj.projectname){
			LEAP.messagebox.alert("项目节点不能修改",2,"消息提示");
			return false;
		}
		var member = this.verifyRoleOfProjectManager(itemObj.projectid);
		var userid = this.getUserInfo().userid;
		if(typeof this.currentItem == "object"){
			if(member){
				var memid =  member.result[0].userid;
				var name = member.result[0].username;
				if(memid && !(memid == userid)){
					var html = "只有主项目经理（"+name+"）才有权执行该操作";
					alert(html);
					return;
				}
			}else{
				alert("只有主项目经理才有权执行该操作");
				return;
			}
		}else{
			alert("该项目未有主经理，请联系管理员");
			return;
		}
		
		// 获取父节点的value值
		var item = LEAP.tree.getItemByValue(this.treeEl,this.currentItem.value);
		var parentCtID = LEAP.tree.getParent(item);
		var parentElement = document.querySelector(parentCtID);
		var parentItem  = {
			value :	parentElement.getAttribute("_value")
		}
		
		if (this.itemOperateForm === null) {
			
			this.itemOperateForm = this.loadForm("lpomprojectplaninfo");
			
		} else {

			this.itemOperateForm.module.clearPageData();
			LEAP.form.show(this.itemOperateForm.form);
			
		}
		
		this.itemOperateForm.module.setPageData(this.currentItem,"modify",parentItem);
	}
  
	/**
	 * 移动节点操作
	 */
	this.moveItem = function(arg){
		
		// 判断是否为项目节点
		var itemObj = JSON.parse(this.currentItem.value);
		if(itemObj.itemname === itemObj.projectname){
			LEAP.messagebox.alert("项目节点不能移动",2,"消息提示");
			return false;
		}
		
		this.movemodule = this.forms("lpommovetree");
		this.movemodule.show();	
		this.movemodule.module.tree_initTree(JSON.parse(this.currentItem.value),this.currentItem.value3);
	}
	
	/**
	 * 设置选择的点
	 */
	this.setSelectedItem = function(arg){
		var element = document.querySelector("[_value='"+ arg.value +"']");
		if(element != null){
			var item = "[ctid=" + element.getAttribute("ctid") + "]";
			LEAP.tree.setSelectedItem(this.treeEl , item );	
		}
	}
	
	/**
	 * 删除节点
	 */
	this.deleteItem = function(arg) {
		if (this.currentItem == null) {
			alert("请选择节点!");
			return;
		}
		var item = JSON.parse(this.currentItem.value);
		var member = this.verifyRoleOfProjectManager(item.projectid);
		var userid = this.getUserInfo().userid;
		if(typeof this.currentItem == "object"){
			if(member){
				var memid =  member.result[0].userid;
				var name = member.result[0].username;
				if(memid && !(memid == userid)){
					var html = "只有主项目经理（"+name+"）才有权执行该操作";
					alert(html);
					return;
				}
			}else{
				alert("只有主项目经理才有权执行该操作");
				return;
			}
		}else{
			alert("该项目未有主经理，请联系管理员");
			return;
		}
		// 根节点
		if (item.itemID === item.projectid) {
			LEAP.messagebox.alert("项目名称不能删除!", 3, "删除失败");
			return;
		}
		// 是否有报工数据
		var projectid = item.projectid;
		var sp = new SearchParameters();
		sp.add("projectid",projectid);
		sp.add("isavailable",1);
		sp.add("syscode", item.syscode);
		//sp.setExtendQuery("and plan.syscode like '"+item.syscode+"%'");
		sp.setOrder("begintime desc");
		var checkIsHaveWorHour = LEAP.request("lpom_searchTaskList",{sp:sp});
		checkIsHaveWorHour = LEAP.convertResult(checkIsHaveWorHour);
		if(LPOM.API.checkIsNotNull(checkIsHaveWorHour)){
			alert("此节点下已包含报工数据，不可删除");
			return false;
		}
		
		
		if(confirm("删除此计划将会删除该计划下所有子计划和任务,是否继续?"))
		{
			var req = this.request("lpom_deleteProPlan",{bean : item},this.deleteRefresh);
		}

		/*
		 * if (window.confirm("是否删除该节点？")) { var req =
		 * this.request("lpom_checkPlanDeleteCondition", { bean : item.itemID
		 * }); // 不能删除 if (req !== null) { LEAP.messagebox.alert(req.message, 2,
		 * "删除失败"); return false; } // 开始删除 var bean = { beanname :
		 * 'lpomprojectplan', id : item.itemID } // 删除节点并刷新父节点 var reqDelete =
		 * this.request("beanDelete", { bean : bean }, this.deleteRefresh); }
		 */
	}

	// 节点变更事件
	this.tree_itemInit = function(arg) {
	
		var currentItem = arg.arg2;// value 当前节点id的全部信息 value2 节点类型
		// 查询当前节点的子节点,并绑定之
		this.bindChildItem(currentItem);
		
	};
	
	
	// 在當前节点下新增节点
	this.bindChildItem = function(currentItem) {
		if (currentItem == null || currentItem.length == 0)
			return;

		var itemObject = JSON.parse(currentItem.value);
		var req = this.request("lpom_searchChildItemOfCurrentItem",{bean : itemObject});
		if(req == null) return;
		
		
		var items = [];
		for ( var int = 0; int < req.length; int++) {
			// value的值
			var itemInfo = {
				itemID : req[int].id,// 当前节点id
				itemname : req[int].name,// 当前节点name
				projectid : req[int].projectid,// 当前节点项目id
				projectname : req[int].projectname,// 当前节点项目名称
				milestoneid : req[int].milestoneid,// 当前节点里程碑节点id
				milestonename : req[int].milestonename,// 当前节点里程碑名称
				postorder : req[int].postorder,// 里程碑排序
				projecttype : req[int].projecttype,
				syscode : req[int].syscode,
				rolename : itemObject.rolename
			};

			var  planend = req[int].planend;
			if(planend.indexOf(" ")){
				planend = planend.split(" ")[0];
			}
			var  planstartdate = req[int].planstartdate;
			if(planstartdate.indexOf(" ")){
				planstartdate = planstartdate.split(" ")[0];
			}
			var ti = planstartdate +"至"+planend;
			
			items[int] = {
				tip : req[int].name,
				text : req[int].name+"（"+ti+"）",
				value : JSON.stringify(itemInfo),
				value2 : "plan",
				value3 : req[int].parentid,
				icon : this.iconPath,
				hasChild : req[int].haschild
			};
		}

		LEAP.tree.addItems(this.treeEl, LEAP.tree.getItemByValue(this.treeEl,currentItem.value), items);

		LEAP.tree.bindData(this.treeEl, LEAP.tree.getItemByValue(this.treeEl,currentItem.value), items, null, {
			text : "text",
			value : "value",
			value2 : "value2",
			value3 : "value3"
		}, function(data) {
			data.hasChild = (data.hasChild);
		});
	}
	

	
	// 在當前节点下新增节点(排除已结束的项目)
	this.bindChildItemWithoutFinished = function(currentItem) {
		if (currentItem == null || currentItem.length == 0)
			return;

		var itemObject = JSON.parse(currentItem.value);
		var req = this.request("lpom_searchChildItemOfCurrentItemWithoutFinished",{bean : itemObject});
		if(req == null) return;
		
		
		var items = [];
		for ( var int = 0; int < req.length; int++) {
			// value的值
			var itemInfo = {
				itemID : req[int].id,// 当前节点id
				itemname : req[int].name,// 当前节点name
				projectid : req[int].projectid,// 当前节点项目id
				projectname : req[int].projectname,// 当前节点项目名称
				milestoneid : req[int].milestoneid,// 当前节点里程碑节点id
				milestonename : req[int].milestonename,// 当前节点里程碑名称
				postorder : req[int].postorder,// 里程碑排序
				projecttype : req[int].projecttype,
				syscode : req[int].syscode,
				rolename : itemObject.rolename
			};

			items[int] = {
				tip : req[int].name,
				text : req[int].name,
				value : JSON.stringify(itemInfo),
				value2 : "plan",
				value3 : req[int].parentid,
				icon : this.iconPath,
				hasChild : req[int].haschild
			};
		}

		LEAP.tree.addItems(this.treeEl, LEAP.tree.getItemByValue(this.treeEl,currentItem.value), items);

		LEAP.tree.bindData(this.treeEl, LEAP.tree.getItemByValue(this.treeEl,currentItem.value), items, null, {
			text : "text",
			value : "value",
			value2 : "value2",
			value3 : "value3"
		}, function(data) {
			data.hasChild = (data.hasChild);
		});

	}

	this.deleteRefresh = function() {
		var item = LEAP.tree.getItemByValue(this.treeEl, this.currentItem.value);

		LEAP.tree.removeItem(this.treeEl, item);
	}

	this.setItem = function() {
		
		var a = LEAP.tree.getAllChild(this.firsetItem);
		if (a && a.length > 0) {
			LEAP.tree.setSelectedItem(this.treeEl, a[0]);
		}
	};

	/**
	 * 传递数据到首页+传递数据到新加的流程页面中
	 */
	this.passTaskData = function(arg) {
		
		var selectedItem  = LEAP.tree.getSelectedItem(this.treeEl);// 获取已选择的节点
		var itemValue = JSON.parse(LEAP.tree.getValue(selectedItem, this.treeEl));// 获取已选择节点的值
		
		if(itemValue == null || typeof itemValue == 'undefined'){
			LEAP.messagebox.alert('请点击关闭',2,"消息提示");
			return false;
		}
		
		if( typeof itemValue.milestoneid === 'undefined'){
			LEAP.messagebox.alert('请选择项目节点下的计划',2,"消息提示");
			return false;
		}
		
		var flag = false ;
		
		// 查看当前用户是否是该项目的成员,并且是否已经进组
		var sp = new SearchParameters();
			sp.setName("lpompromember");
			sp.addParameter("projectid",itemValue.projectid,11);
			sp.addParameter("userid",this.getUserInfo().userid,11);// 是成员
			sp.addParameter("ischecked",1,11);// 已进组
			
			/*
			 * if(itemValue.projecttype &&itemValue.projecttype !='0'){
			 * sp.addParameter("rolename",2,11);// 项目经理 flag =true ; }
			 */
			sp.pageNum=1;
			sp.pageSize=999;
		   var req = this.request("beanSearch",{ sp : sp });
		 
		   if(!req){
				 if(flag){
					 LEAP.messagebox.alert("本类型项目只能由已进组项目经理发布任务!",2,"消息提示");
				 }else{
					 LEAP.messagebox.alert("本类型项目只能由已进组项目成员发布任务!",2,"消息提示");
				 }
				return false;
			}
		
		// 写默认值进数据库
		var ckbox =  document.getElementById("rememberme_DIV_4396");
		if(ckbox.checked){
			var parr = new SearchParameters();
			parr.name = "lpompersonaldata";
			parr.addParameter("modulename", "lpomindex", 11);
			parr.addParameter("stvalue", "INPUT_6701", 11);
			parr.addParameter("userid", this.getUserInfo().userid, 11);
			parr.addField("id");
			parr.pageNum=1;
			parr.pageSize=999;
			var ress = this.request("beanSearch",
			{
				value	: parr
			});        
			if(ress&&ress.size>0){
				// 已有默认值
				var dataid = ress.result[0].id;
				var updateBean = {};
				updateBean.beanname = 'lpompersonaldata';
				updateBean.id = dataid;
				updateBean.tagvalue = itemValue;
				LEAP.request("beanModify",
						{
							data: updateBean
						});
			}else{
				var inbean = {};
				inbean.beanname = 'lpompersonaldata';
				inbean.id = UUID.randomUUID().replaceall("-", "");
				inbean.userid = this.getUserInfo().userid;
				inbean.modulename = 'lpomindex';
				inbean.stvalue = 'INPUT_6701';
				inbean.tagvalue = itemValue;
				LEAP.request("beanCreate",
				{
					par: inbean,
					childPar: null
				});
			}
		}
		
		this.getParentModule().setPlanValuesOfTask(itemValue);
		this.hideForm();
		
		
	}
	
	/**
	 * 设置页面样式
	 */
	this.setPageStyle = function(arg){
	
		
		this.st("treeOperate").hide();
		this.st("DIV_4396").show();
		this.st("UL_b635").element.style.height = "91%";
		this.value = arg;

		var bean = null;
		// 查询当前的节点父级信息
		if(this.value && this.value.itemID){
			bean = {
				itemID : this.value.itemID
			}	
		}
		
		this.res = this.request("lpom_initsearchtree",{
			value:bean,
			map:null
		});

		if(this.res){
			
			var ttype = "";
			var sp = new SearchParameters();
			sp.setName("lpomprobasic");
			sp.addParameter("id",arg.projectid,11);
			sp.pageNum=1;
			sp.pageSize=16;
			var reqs = this.request("beanSearch",{sp : sp});
			if(reqs != null){
				reqs = LEAP.convertResult(reqs);
				ttype = reqs[0].projecttype;
			}
			var topitem ={
					itemID : arg.projectid,
					itemname : arg.projectname,
					projectid : arg.projectid,
					rolename : arg.rolename,
					projectname : arg.projectname,
					projecttype : ttype+""
			}
			var ff = LEAP.tree.getItemByValue(this.treeEl,JSON.stringify(topitem));
			LEAP.tree.expandNode(ff);
			
			for (var i= 0;i < this.res.length-1;i++){
				var inititem = {
						itemID : this.res[i].id,
						itemname : this.res[i].name,
						projectid : this.res[i].projectid,
						projectname : this.res[i].projectname,
						milestoneid : this.res[i].milestoneid,
						milestonename : this.res[i].milestonename,
						postorder : this.res[i].postorder,
						projecttype : this.res[i].projecttype,	
						syscode : this.res[i].syscode,
						rolename : arg.rolename	
				}
				var aa ={
					value:JSON.stringify(inititem)
				}
				// 加载节点
				this.bindChildItem(aa);	
				LEAP.tree.expandNode(JSON.stringify(inititem));
			}
			
			// 默认选择节点
			var last = {
					itemID : this.res[this.res.length-1].id,
					itemname : this.res[this.res.length-1].name,
					projectid : this.res[this.res.length-1].projectid,
					projectname : this.res[this.res.length-1].projectname,
					milestoneid : this.res[this.res.length-1].milestoneid,
					milestonename : this.res[this.res.length-1].milestonename,
					postorder : this.res[this.res.length-1].postorder,
					projecttype : this.res[i].projecttype,	
					syscode : this.res[this.res.length-1].syscode,
					rolename : arg.rolename		
			}
			var bb =JSON.stringify(last)
			var gg = LEAP.tree.getItemByValue(this.treeEl,bb);
			LEAP.tree.setSelectedItem(this.treeEl, gg);
		}
		
	}
}

