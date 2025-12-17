if(!window.lbcp){
	 LBCP= {};
	 window.lbcp = LBCP;
}else{
	LBCP = 	window.lbcp;
}

LBCP.DocumentView = {};

LBCP.DocumentView.CreateTaskPane = function(){
	var tsId = wps.PluginStorage.getItem("taskpane_id")
    if (!tsId){
        var tskpane = wps.CreateTaskPane("https://baidu.com")
        var id = tskpane.ID
        wps.PluginStorage.setItem("taskpane_id", id)
        tskpane.Visible = true
    }else{
        var tskpane = wps.GetTaskPane(tsId)
        tskpane.Visible = true
    }
}


LBCP.DocumentView.saveAndUpload = function()
{
	//获取临时目录
	var tempPath = wps.Env.GetTempPath();	
	var filePath = tempPath + "//temp.docx";
	
	//先删除之前可能存在的临时文件
	wps.FileSystem.Remove(filePath); 
	
	//获取activeDocument
	var doc = wps.WpsApplication().ActiveDocument;
	
	//保存
	process.SetDocParamsValue(doc, PARAM_Enum.ignoreBeforeSave,true); 
	doc.SaveAs2(filePath); 
	
	////获取OA端打开模板文件时传入的文件上载路径
	var l_uploadPath = process.GetDocParamsValue(doc, PARAM_Enum.uploadPath); 
	
	//上传
	process._UploadFile("abc.docx", filePath, l_uploadPath, "file", LBCP.DocumentView._onUploadSuccess, LBCP.DocumentView._onUploadFail);
	
}

LBCP.DocumentView._onUploadSuccess = function(arg)
{
	var l_doc = wps.WpsApplication().ActiveDocument;
	var l_Params = wps.PluginStorage.getItem(l_doc.DocID);
	var l_objParams = JSON.parse(l_Params);
	
	//上传成功结果
	var l_data = JSON.parse(arg);
	//拼一个结果对象，可以把传入的参数放进来，便于OA端区分处理，如标识生成了"生成清样表"、"生成领导批示表"等
	var l_msg = {action:l_objParams.exparam.convertPar.actionname, msg:l_data,param:l_objParams.exparam.convertPar};
	 
	
	if(l_objParams.converAlert){
		alert(l_objParams.converAlert);
	}
	
	//发送一个通知到OA
	process._WebNotify(l_doc, l_msg);
	
}

LBCP.DocumentView._onUploadFail = function(arg)
{
	alert("上传失败");
}

LBCP.DocumentView.convert_PDF_Upload = function()
{
	//获取临时目录
	var tempPath = wps.Env.GetTempPath();	
	var filePath = tempPath + "//temp.pdf";
	
	//先删除之前可能存在的临时文件
	wps.FileSystem.Remove(filePath); 
	
	//获取activeDocument
	var doc = wps.WpsApplication().ActiveDocument;
	
	doc.ExportAsFixedFormat(filePath, 17, true); //文档另存为PDF格式
	//doc.SaveAs2(filePath);
	var l_uploadPath = process.GetDocParamsValue(doc, PARAM_Enum.uploadPath); 
    //上传
	process._UploadFile("abc.pdf", filePath, l_uploadPath, "file", LBCP.DocumentView._onUploadSuccess, LBCP.DocumentView._onUploadFail);
	
}


LBCP.DocumentView.convert_OFD_Upload = function()
{
	//获取临时目录
	var tempPath = wps.Env.GetTempPath();	
	var filePath = tempPath + "//temp.ofd";
	
	//先删除之前可能存在的临时文件
	wps.FileSystem.Remove(filePath); 
	
	//获取activeDocument
	var doc = wps.WpsApplication().ActiveDocument;
	
	doc.ExportAsFixedFormat(filePath, 23, true);
   // doc.SaveAs2(filePath);
    process.SetDocParamsValue(doc, PARAM_Enum.ignoreBeforeSave,true); 
	doc.SaveAs2(filePath, "102");
	
	
    var l_uploadPath = process.GetDocParamsValue(doc, PARAM_Enum.uploadPath); 
    //上传
	process._UploadFile("abc.ofd", filePath, l_uploadPath, "file", LBCP.DocumentView._onUploadSuccess, LBCP.DocumentView._onUploadFail);
	
	
	
}

/***********************************模板书签填值打印************************************************/
/**
 * 打印办文表单
 * @param {} domain 作用域 this
 * @param {} url 模板路径
 * @param {} printdata 打印的数据（key值为模板内的书签值）
 * @param {} cellcount 送签情况每行填写的个数
 * @param {} sqqkline 送签情况所在的行数
 * @param {} exparam 扩展参数{transbyserver：“任意值打印方式后端服务”，gwid：“查询送签情况使用”，isprotect：“开启文档保护”}
 */
LBCP.DocumentView.initprint = function(domain, url, printdata, cellcount, sqqkline,exparam) {
	if(exparam && exparam.transbyserver){
		if(!exparam){
			exparam ={};
		}
		exparam.cellcount = cellcount;
		exparam.sqqkline = sqqkline;
		//exparam.gwid = domain.data.id;
		//exparam.isprotect = true;
		var filestr = LEAP.request("loap_print_transWordByData",{printdata:printdata,url:url,exparam:exparam,type:""});
		if(filestr.indexOf("失败") == -1){
			var files = JSON.parse(filestr);
			LBCP.DocumentView.openAttFile({filedata:files},domain);
		}else{
			alert(filestr);
			return;
		}
	}else{
		
		url = leapconfig.server   + url;
		if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
			LBCP.DocumentView.initprint_btn_wpsAddon(domain, url, printdata, cellcount, sqqkline)
		}else{
			LBCP.DocumentView.initprint_btn_nkoffice(domain, url, printdata, cellcount, sqqkline)
		}
	}
}
/**
 * 嵌入式方式打开
 * @param {} domain
 * @param {} url
 * @param {} printdata
 * @param {} cellcount
 * @param {} sqqkline
 */
LBCP.DocumentView.initprint_btn_nkoffice = function(domain, url, printdata, cellcount, sqqkline)
{
	var _form = domain.loadForm('loapprint', '办文表单');
    LEAP.form.maxSize(_form.form);
    //判断是不是用了iweboffice
    var afterloadfn = LBCP.DocumentView.afterOpenMyTemplate_nkoffice;
    if(LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
  		afterloadfn = LBCP.DocumentView.afterOpenMyTemplate_iweboffice;
    }
    var par = {
        url: url,
        afterload: afterloadfn,
        buttons: "saveAs,print",
        exparam:{domain:domain,printdata:printdata,cellcount:cellcount,sqqkline:sqqkline}
    };
    LEAP.asyn(_form.module.init, _form.module, 500, par, domain);
}
/**
 * 加载项打开
 * @param {} domain 作用域 this
 * @param {} url 模板路径
 * @param {} printdata 打印的数据（key值为模板内的书签值）
 * @param {} cellcount 送签情况每行填写的个数
 * @param {} sqqkline 送签情况所在的行数
 */
LBCP.DocumentView.initprint_btn_wpsAddon = function(domain, url, printdata, cellcount, sqqkline){
	//构造数据
	//获取签名图片
	var opdata =  printdata.opiniondata;
	if(opdata){
		 for (var key in opdata) {
	       if(printdata.opiniondata[key]){
			 	for (var i = 0; i < printdata.opiniondata[key].length; i++) {
			 		 if (printdata.opiniondata[key][i].opiniontime && printdata.opiniondata[key][i].opiniontime.time) {
			 			printdata.opiniondata[key][i].optimes = LEAP.formatdate(printdata.opiniondata[key][i].opiniontime.time, 0);
			 		 }
		             var username = printdata.opiniondata[key][i].userflag;
		             var handsign_t = LWFP.innerApi.SignImg.getSignImg(username);
		        	 if(handsign_t){
			             var handsign = JSON.parse(handsign_t.imguri);
			             var localJPGPath = leapconfig.server + "LEAP/Download/" + handsign.nameedPath + "/" + handsign.name;
			             printdata.opiniondata[key][i].handsign = localJPGPath;
			           //  printdata.opiniondata[key][i].pdf417code = leapconfig.server + "LEAP/LOAP/Plugin/javascript/1598346453019.png";
		        	 }
		        }
	       }
		 }
	}
	//获取sqqk
	var id = domain.data.id;
    var par = new SearchParameters();
    par.name = "lbcpfawensq";
    par.addParameter("fwid", id, 11);
	par.addField("sqsj");
	par.addField("qpr");
	par.addField("fhsj");
    par.setOrder("sqsj");
    par.pageNum = 1;
	par.pageSize = 300;
    var sqqkdata = LEAP.routerRequest('beanSearch', {
        par: par
    });
    if(sqqkdata){
    	sqqkdata =  LEAP.convertResult(sqqkdata);
    }
	//获取办理情况 
	var blqkdata = null;
	if (domain.workflow) {
        if (domain.data.wf_entry_id) {
            blqkdata = LEAP.routerRequest("lbcp_getBLQK", {
                entryid: domain.data.wf_entry_id
            });
            if(blqkdata){
            	 for (var i = 0; i < blqkdata.length; i++) {
            	 	 if (blqkdata[i].opiniontime && blqkdata[i].opiniontime.time) {
			 			blqkdata[i].optimes = LEAP.formatdate(blqkdata[i].opiniontime.time, 0);
			 		 }
		             var username = blqkdata[i].userflag;
		             var handsign_t = LWFP.innerApi.SignImg.getSignImg(username);
		        	 if(handsign_t){
			             var handsign = JSON.parse(handsign_t.imguri);
			             var localJPGPath = leapconfig.server + "LEAP/Download/" + handsign.nameedPath + "/" + handsign.name;
			             blqkdata[i].handsign = localJPGPath;
		        	 }
		        }
            }
        }
    }
	if(printdata.selectldps && printdata.selectldps.length >0){
    	 for (var i = 0; i < printdata.selectldps.length; i++) {
    	 	 if (printdata.selectldps[i].opiniontime && printdata.selectldps[i].opiniontime.time) {
	 			printdata.selectldps[i].optimes = LEAP.formatdate(printdata.selectldps[i].opiniontime.time, 0);
	 		 }
             var username = printdata.selectldps[i].userflag;
             var handsign_t = LWFP.innerApi.SignImg.getSignImg(username);
        	 if(handsign_t){
	             var handsign = JSON.parse(handsign_t.imguri);
	             var localJPGPath = leapconfig.server + "LEAP/Download/" + handsign.nameedPath + "/" + handsign.name;
	             printdata.selectldps[i].handsign = localJPGPath;
        	 }
        }
	}
	
	var isProtect = true;
    if (printdata.extendPar && printdata.extendPar.isProtect == false ) 
	{
		isProtect =  false;
	}
	if (null != domain.organsAllowedToEditWord) 
	{
		var usIf = LEAP.getUserInfo();
		var _organs = domain.organsAllowedToEditWord.split(",");
		for ( var i = 0; i < _organs.length; i++) 
		{
			if (usIf.orgCNName == _organs[i])// 当登录用户机构 与 配置机构一致开启编辑权限
			{
				isProtect = false;
				break;
			}
		}
	}
	/*if (isProtect) 
	{
		// 进行加密保护
		var psw = UUID.randomUUID().replaceall('-', '');
		myDocument.Protect(3, false, psw, false, false);// 常量：wdAllowOnlyReading=3;
	}*/
	if(printdata){
		printdata.isProtect = isProtect;
	}
	if(printdata.useurl){//数据较多的情况下，国产环境数据传递异常时使用
		//将数据存入到数据库中		
		var bean ={};
		var uuid = UUID.randomUUID().replaceall('-', '');
		bean.beanname = "lbcpannotationbureau";//借用数据表
		bean.id = uuid;
		bean.content = JSON.stringify(printdata);
		var bool = LEAP.routerRequest('lbcp_beanInsert', {
	        bean: bean
	    });
	    if(!bool){	    	
	    	return;
	    }
	    var dataurl = {url:leapconfig.server+"restservices/lbcprest/lbcp_rest_getPrintData/query",id:uuid};
		//二次传参 通过url获取数据
		printdata = {fwbt:printdata.fwbt,dataurl:dataurl}
	}
	var fwbt = "";
	if(printdata && printdata.fwbt){
		fwbt = printdata.fwbt.replaceall("\\","").replaceall("\/","").replaceall("\:","").replaceall("\*","")
				.replaceall("\?","").replaceall("\"","").replaceall("\<","").replaceall("\>","").replaceall("\|","");
	}
	
	if(url.indexof("?")!=-1){
		if(url.indexof("sid=") ==-1){
			url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
	}else{
		url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
	}
	var param = {   docType:LEAP.WPSAddon.docType.wps,
					docId: UUID.randomUUID(),
					fileTitle: fwbt,
				    fileName: url,
				    //converAlert: "版式文件转换成功，请回到系统页面查看",
				    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
				    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
				    customAfterOpenFn: "LBCP.DocumentView.afterOpenMyTemplate_wpsAddon", 
				    hideDefaultButtons:true,
				    //buttons: "submit,saveAs,showMark,hideMark,importDoc,taohong,safeDoc,deleteSafe,ConvertPDF,ConvertOFD",
				    customButtons: null,
				    exparam:{myBookmarks:null,EntityBeans:{printdata:printdata,cellcount:cellcount,sqqkline:sqqkline,blqkdata:blqkdata,sqqkdata:sqqkdata}},
					notifyFn:null,
					waterMark: leapconfig.server + LEAP.getWaterMark(),
					domain:domain
				};
				
	LEAP.WPSAddon.OpenDocument(param);
}
/**
 * wpsAddon 打印填充数据方法
 */
LBCP.DocumentView.afterOpenMyTemplate_wpsAddon= function(){
	//alert("调用了 LBCP.DocumentView.afterOpenMyTemplate  方法");
	//获取activeDocument
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");	
	//插入文本
	if (myParam.EntityBeans)
	{
    try {
    	
    	process.SetDocParamsValue(myDocument, PARAM_Enum.ignoreBeforeSave, true); 

    	var exparam = myParam.EntityBeans;
        var imgtype = null; //二维码图片格式
        
        if(exparam.printdata && exparam.printdata.dataurl && exparam.printdata.dataurl.url && exparam.printdata.dataurl.id){
			//借用表lbcpannotationbureau
			exparam.printdata = LBCP.DocumentView._UrlGetPrintData(exparam.printdata.dataurl.url,exparam.printdata.dataurl.id);
		}
        
        var json = exparam.printdata;
        
        var richtextfiled = exparam.printdata.richtextfiled;
        var richtextfileds = [];
        if(richtextfiled){
        	richtextfileds =richtextfiled.split(",");
        }
        for (var key in json) {
            if (myDocument.Bookmarks.Exists(key)) {
            	if(richtextfileds && richtextfileds.length>0 && richtextfileds.indexOf(key) !=-1){
            		LBCP.DocumentView.copyToClipboard(json[key]);
            		LBCP.DocumentView.copyToClipboard(json[key]);
            		myDocument.Bookmarks.Item(key).Range.Paste();
            	}else{
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore(json[key]);
            	}               
            }
        }
        var specilbookmarks = exparam.printdata.specialbookmarks;
        if(specilbookmarks){
        	 for (var key in specilbookmarks) {
	            if (myDocument.Bookmarks.Exists(key)) {
        	 	//if (key) {
	                //myDocument.Bookmarks.Item(key).Range.InsertSymbol(254,"Wingdings");
	            	myDocument.Bookmarks(key).Range.InsertSymbol(82,"Wingdings 2");
	            }
	        }
        	
        }
        var subindex = 16;
        var marginleft = 300;
        var timetype = exparam.printdata.opiniontimetype; // 0 1 2 
        var opinionuserexpstr = exparam.printdata.opinionuserexpstr; //署名规则 [$top2orgname$-$username$]  [$toporgname$-$username$]
        if (timetype != undefined)
        {
        	if (timetype == "0")
        	{
        		subindex = 19;
        		marginleft =280;
        	}
        	else if (timetype == "1")
        	{
        		subindex = 16;
        		marginleft = 300;
        	}
        	else if (timetype == "2")
        	{
        		subindex = 10;
        		marginleft = 320;
        	}
        }
        
        var opinionusernameexp = exparam.printdata.opinionusernameexp; // 0 1 2 
        var opdata = exparam.printdata.opiniondata;
        if(opdata){
	        for (var key in opdata) {
	            if (myDocument.Bookmarks.Exists(key)) {
	                myDocument.Bookmarks.Item(key).Range.Select();
	                var arr = opdata[key];
	                for (var i = 0; i < arr.length; i++) {
	                    var op = arr[i];
	                    var strs = "";
	                    op.opinioncontent =  op.opinioncontent.replace(/\r\n/g,"\n");
	                    op.opinioncontent =  op.opinioncontent.replace(/\n/g,"\r\n");
	
	                    var contents = op.opinioncontent.split("\r\n");
	                    for (var j = 0; j < contents.length; j++) {
	                        if (contents[j] != null && contents[j] != "" && strs == "") {
	                            strs = "    " + contents[j].trim();
	                        } else if (contents[j] != null && contents[j] != "") {
	                            strs = strs + "\n" + "    " + contents[j].trim();//\r
	                        }
	                    }
	                    
	                    myDocApp.Selection.InsertBefore(strs);
	                    myDocApp.Selection.InsertRowsBelow(1);
	                    myDocApp.Selection.Range.ParagraphFormat.Alignment = 2;
	                    if (myDocApp.ActiveDocument.Application.Selection && myDocApp.ActiveDocument.Application.Selection.Rows.Item(1))
	                    {
	                		myDocApp.ActiveDocument.Application.Selection.Rows.Item(1).Cells.Item(1).Range.ParagraphFormat.LineSpacing = 24;
	                	}
	                    var str = "";
	                    var username = op.username;
	                    var handsign = op.handsign; //LWFP.innerApi.SignImg.getSignImg(username);
	                    //timetype 0 就是全部 1 就说到分钟  2就是 日期
	                    if(!timetype){
	                    	timetype = op.timetype;
	                    }
	                    var pdf417code = op.pdf417code;
	                    if (timetype != undefined)
	                    {
	                    	if (timetype == "0")
	                    	{
	                    		subindex = 19;
	                    		marginleft = 280;
	                    	}
	                    	else if (timetype == "1")
	                    	{
	                    		subindex = 16;
	                    		marginleft = 300;
	                    	}
	                    	else if (timetype == "2")
	                    	{
	                    		subindex = 10;
	                    		marginleft = 320;
	                    	}
	                    }
	                    if (op.specialsign) {
	                        str = op.specialsign;
	                    } else if (handsign) {//TODO
	                        var localJPGPath = handsign;
	                        myDocApp.ActiveDocument.Application.Selection.MoveLeft(1);
	            			if (pdf417code) {
	            				myDocApp.ActiveDocument.Application.Selection.Rows.Item(1).Cells.Item(1).RightPadding = 90;
	            			}
	                        //签名位置调整
	                       // activedocument.AddPicFromURL(localJPGPath, true, -110, 0, 1, 30, 1); // localJPGPath
	                       // var Shape = myDocument.Shapes.AddPicture(localJPGPath, false, true,100, 475);
	                        var  inlineshape = myDocApp.Selection.InlineShapes.AddPicture(localJPGPath, false, true);
	                        inlineshape.ScaleHeight = 25;
	                        inlineshape.ScaleWidth = 25;
	                      	var shape = inlineshape.ConvertToShape();
	                        shape.ShapeStyle = 1;
	                        if (pdf417code) {
	                       		 shape.Left = marginleft-50;
	                        }else{
	                        	 shape.Left = marginleft;
	                        }
	                        shape.Top = 0;
	                        //MsoShapeStyleIndex
	                        // myDocument.AddPicFromURL(localJPGPath, true, marginleft, 0, 1, 30, 1); //localJPGPath
	                        var str = "  ";
	                        
	                        if (op.optimes) {
	                        	str = "  " + op.optimes.substring(0, subindex);
	                        }
	                        if (pdf417code) {//TODO
	                        	var  inlineshape = myDocApp.Selection.InlineShapes.AddPicture(pdf417code, false, true);
		                        inlineshape.ScaleHeight = 100;
		                        inlineshape.ScaleWidth = 100;
		                      	var shape = inlineshape.ConvertToShape();
		                        shape.ShapeStyle = 1;
		                        shape.Left = 430;
		                        shape.Top = 0;
	                        	//myDocument.AddPicFromURL(pdf417code, true, 20, 4, 1, 100, 1);
							}
	                        myDocApp.Selection.InsertAfter("");
	                    } else {
	                    	if (op.optimes) {
	                    		
	                    		if(opinionuserexpstr){
	                    			str = opinionuserexpstr.replace("$top2orgname$",op.top2orgname).replace("$toporgname$",op.toporgname).replace("$organname$",op.organname).replace("$username$",op.username) +"  " + op.optimes.substring(0, subindex);
	                    		}else{
	                        		str = op.username + "  " + op.optimes.substring(0, subindex) +" ";
	                    		}
	                    		
	                    		
	                        }
	                        //str = op.username + "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, 16);;
	                    }
	                     
	                    myDocApp.Selection.InsertBefore(str);
	                    myDocApp.Selection.InsertRowsBelow(1);
	                    if (myDocApp.ActiveDocument.Application.Selection && myDocApp.ActiveDocument.Application.Selection.Rows.Item(1))
	                    {
	                    	myDocApp.ActiveDocument.Application.Selection.Rows.Item(1).Cells.Item(1).RightPadding = 6;
	                    }
	                    myDocApp.Selection.Range.ParagraphFormat.Alignment = 0;
	                   
	                   // myDocApp.Selection.Delete();
	                }
	                // myDocApp.Selection.MoveDown();
	                 myDocApp.Selection.Rows.Delete();
	            }
	 			
	        }
        }
        
        if(exparam.printdata.selectldps && exparam.printdata.selectldpsline > 0){
         if (exparam.printdata.selectldps && exparam.printdata.selectldps.length != 0) {
                var arr = exparam.printdata.selectldps;
                var p = exparam.printdata.selectldpsline;
                var table = myDocument.Tables.Item(1);
                table.Rows.Item(p).Select();
                myDocApp.Selection.InsertRowsBelow(arr.length * 2);
                //var table = myDocument.Tables(1);
                for (var i = 0; i < arr.length; i++) {
                    var op = arr[i];
                    var row = table.Rows.Item(p + i * 2);
                    //row.Cells.Merge();
                    row.Cells.Item(1).Range.ParagraphFormat.Alignment = 0;
                    row.Cells.Item(1).Range.ParagraphFormat.IndentFirstLineCharWidth(2);
                    var strs = "";
                    var contents = op.opinioncontent.split("\r\n");
                    for (var j = 0; j < contents.length; j++) {
                        if (contents[j] != null && contents[j] != "" && strs == "") {
                            if (i == 0) {
                                strs = contents[j].trim();
                            } else {
                                strs = contents[j].trim();
                            }
                        } else if (contents[j] != null && contents[j] != "") {
                            strs = strs + "\n"  + contents[j].trim();//\r
                        }
                    }
                    row.Cells.Item(1).Range.InsertAfter(strs);
                    var row = table.Rows.Item(p + i * 2 + 1);
                   // row.Cells.Merge();
                    row.Cells.Item(1).Range.ParagraphFormat.Alignment = 2;
                    row.Cells.Item(1).Range.ParagraphFormat.LineSpacing = 24;
                    
                    //row.cells(1).RightPadding = 20;
                    
                    row.Cells.Item(1).Range.ParagraphFormat.IndentFirstLineCharWidth(2);
                    var str = "";
                    var str = "";
                    var username = op.username;
                    var handsign = op.handsign;
                    if (op.specialsign) {
                        str = op.specialsign;
                    } else if (handsign) {
                        var localJPGPath = handsign;
                        row.Cells.Item(1).Select();
                        var aa = myDocApp.ActiveDocument.Application.Selection.MoveLeft(1);
                        
                        var  inlineshape = myDocApp.Selection.InlineShapes.AddPicture(localJPGPath, false, true);
                        inlineshape.ScaleHeight = 20;
                        inlineshape.ScaleWidth = 20;
                      	var shape = inlineshape.ConvertToShape();
                        shape.ShapeStyle = 1;
                        shape.Left = marginleft;
                        shape.Top = 0;
                        // 签名位置调整
                       // activedocument.AddPicFromURL(localJPGPath, true, -110, 0, 1, 30, 1); // localJPGPath
                        var str = "  "  + "  " + op.optimes.substring(0, subindex);
                        row.Cells.Item(1).Range.InsertAfter("");
                    } else {
                    	
                    	if(opinionuserexpstr){
                			str = opinionuserexpstr.replace("$top2orgname$",op.top2orgname).replace("$toporgname$",op.toporgname).replace("$organname$",op.organname).replace("$username$",op.username) +"  " + op.optimes.substring(0, subindex);
                		}else{
                    		str = op.username + "  " + op.optimes.substring(0, subindex);
                		}
                       // str = op.username  + "  " + op.optimes.substring(0, subindex);
                    }
                    row.Cells.Item(1).Range.InsertAfter(str);
                }

           		 table.Rows.Item(table.Rows.Count).Select();
           		 myDocApp.Selection.Rows.Delete();
            }
        }
       	var blqkdata = exparam.blqkdata;
        if (blqkdata && myDocument.Bookmarks.Exists("blqk")) {
            myDocument.Bookmarks.Item("blqk").Range.Select();
            for (var i = 0; i < blqkdata.length; i++) {
                var op = blqkdata[i];
                var strs = "";
                var contents = op.opinioncontent.split("\r\n");
                for (var j = 0; j < contents.length; j++) {
                    if (contents[j] != null && contents[j] != "" && strs == "") {
                        strs = "    " + contents[j].trim();
                    } else if (contents[j] != null && contents[j] != "") {
                        strs = strs + "\n" + "    " + contents[j].trim();//\r
                    }
                }
                myDocApp.Selection.InsertBefore(strs);
                myDocApp.Selection.InsertRowsBelow(1);
                myDocApp.Selection.Range.ParagraphFormat.Alignment = 2;

                var str = "";
                var username = op.username;
                var handsign = op.handsign;
                if (op.specialsign) {
                    str = op.specialsign;
                } else if (handsign) {//TODO
                    var localJPGPath = handsign;
                    var aa = myDocApp.ActiveDocument.Application.Selection.MoveLeft(1);
                    //签名位置调整
                    var  inlineshape = myDocApp.Selection.InlineShapes.AddPicture(localJPGPath, false, true);
                    inlineshape.ScaleHeight = 20;
                    inlineshape.ScaleWidth = 20;
                  	var shape = inlineshape.ConvertToShape();
                    shape.ShapeStyle = 1;
                    shape.Left = marginleft;
                    shape.Top = 0;
                    
                   // myDocument.AddPicFromURL(localJPGPath, true, -170, 0, 1, 50, 1); //localJPGPath
                    var str = "  ";

                    str = "  " + op.opiniontime.substring(0, 16);;
                    myDocApp.Selection.insertAfter("");
                } else {
                	if(opinionuserexpstr){
            			str = opinionuserexpstr.replace("$top2orgname$",op.top2orgname).replace("$toporgname$",op.toporgname).replace("$organname$",op.organname).replace("$username$",op.username) +"  " + op.optimes.substring(0, subindex);
            		}else{
                		str = op.username + "  " + op.optimes.substring(0, subindex);
            		}
                   // str = op.username + "  " + op.opiniontime.substring(0, 16);;
                }
                myDocApp.Selection.InsertBefore(str);
                myDocApp.Selection.InsertRowsBelow(1);
                myDocApp.Selection.Range.ParagraphFormat.Alignment = 0;
            }

        }

        var sqqkdata = exparam.sqqkdata;
        if (sqqkdata && exparam.cellcount > 0 && exparam.cellcount > 0 && exparam.sqqkline >0) {
            var table = myDocument.Tables.Item(1);
            var bounds = Math.ceil(sqqkdata.length / exparam.cellcount);
            if (bounds > 1) {
                // 把首页的3行送签放到剪贴板
                table.Rows.Item(exparam.sqqkline).Select();
                myDocApp.Selection.MoveEnd(exparam.cellcount + 1, 2);
                myDocApp.Selection.Copy();
                for (var i = 1; i < bounds; i++) {
                    table.Rows.Item(i * 3 + exparam.sqqkline).Select();
                    myDocApp.Selection.Paste();
                }
            }
            for (var i = 0; i < bounds; i++) {
                var __rowIdx = i * 3 + exparam.sqqkline;
                for (var k = 0; k < exparam.cellcount; k++) {
                    var __idx = i * exparam.cellcount + k;
                    if (__idx < sqqkdata.length) {
                        var sq = sqqkdata[__idx];
                        table.Rows.Item(__rowIdx).Cells.Item(k + 2).Range.InsertAfter(sq.sqsj.substring(5, 10));
                        table.Rows.Item(__rowIdx + 1).Cells.Item(k + 2).Range.InsertAfter(sq.qpr);
                        table.Rows.Item(__rowIdx + 2).Cells.Item(k + 2).Range.InsertAfter((sq.fhsj) ? sq.fhsj.substring(5, 10) : " ");
                    }
                }
            }
        }
        //设置密码
        if(exparam.printdata && exparam.printdata.isProtect){
        	if(exparam.printdata && exparam.printdata.extendPar && exparam.printdata.extendPar.password){
        		myDocument.Protect(3, false, exparam.printdata.extendPar.password, false, false);
        	}else{
        		var pwd = Math.random().toString(36).slice(-6);
        		myDocument.Protect(3, false, "longrise"+pwd, false, false);
        	}
        	 myDocApp.CommandBars.SetEnabledMso("Copy", false);
        }else{
			myDocApp.CommandBars.SetEnabledMso("Copy", true);
		}
        //直接转pdf或者转ofd
        
        
        
    } finally {
        myDocApp = myDocument = Range = opinions = arr = table = i = op = row = k = sq = pagesCount = idx = rg = row = sqIdx = bonds = _idx = null;
    }
	}	
}
LBCP.DocumentView.cpcontent = "";
/**
 * 监听粘贴命令，赋值
 * @param {} obj
 */
LBCP.DocumentView.copyToClipboard = function(obj) {
	LBCP.DocumentView.cpcontent = obj;
  	document.addEventListener('copy',LBCP.DocumentView.setClipboardText);
  	document.execCommand("copy");
}
/**
 * 执行copy命令后续执行
 * @param {} event
 * @return {}
 */
LBCP.DocumentView.setClipboardText =  function(event){
	try{
        event.preventDefault();
        document.removeEventListener('copy',LBCP.DocumentView.setClipboardText);
        if(event.clipboardData){
            event.clipboardData.setData("text/html", LBCP.DocumentView.cpcontent);
            event.clipboardData.setData('text/plain', LBCP.DocumentView.cpcontent);
        }
        else if(window.clipboardData){
		    return window.clipboardData.setData("text", LBCP.DocumentView.cpcontent);
		}		
	}finally{
		LBCP.DocumentView.cpcontent = "";
	}
};



/**
 * 默认打印填充数据方法
 * @param {} myDocument
 * @param {} activedocument
 * @param {} exparam
 */
LBCP.DocumentView.afterOpenMyTemplate_nkoffice = function(myDocument, activedocument,exparam) {
    return LBCP.DocumentView.__afterOpenMyTemplate_nkoffice(null, true, myDocument, activedocument,exparam);
}
LBCP.DocumentView.__afterOpenMyTemplate_nkoffice = function(template, dispApp, myDocument, activedocument,exparam) {
    try {
        var imgtype = null; //二维码图片格式
        var myDocApp = null;
        if (myDocument == null) {
            myDocApp = new ActiveXObject("word.Application"); //mydocapp就是这个
            if (dispApp == true) myDocApp.Application.Visible = true;
            myDocument = myDocApp.Documents.Open(template);
        } else {
            myDocApp = myDocument.application;
        }
        
        var isopenwithwps = false;
        
        if(myDocApp.ActiveDocument && myDocApp.ActiveDocument.application && myDocApp.ActiveDocument.application.path){
        	//"d:\Program Files (x86)\Kingsoft\WPS Office\11.8.2.10321\office6"
        	if(myDocApp.ActiveDocument.application.path.indexof("WPS")!=-1){
        		isopenwithwps = true;
        	}
        	
        }
        
        var json = exparam.printdata;
        for (var key in json) {
            if (myDocument.BookMarks.Exists(key)) {
                myDocument.Bookmarks(key).Range.InsertBefore(json[key]);
            }
        }
        var specilbookmarks = exparam.printdata.specialbookmarks;
        if(specilbookmarks){
        	 for (var key in specilbookmarks) {
	            if (myDocument.BookMarks.Exists(key)) {
	                myDocument.Bookmarks(key).Range.InsertSymbol(82,"Wingdings 2");
	            }
	        }
        	
        }
        
        var timetype = exparam.printdata.opiniontimetype; // 0 1 2 
       // var timetype = 0; // 0 1 2 
        var subindex = 16;
        var marginleft = -170;
        var pdf417left = 130;
        if (timetype != undefined)
        {
        	if (timetype == "0")
        	{
        		subindex = 19;
        		marginleft = -180;
        		pdf417left = 150;
        		
        		if(!isopenwithwps){
        			marginleft = -180;
        			pdf417left = 20;
        		}
        	}
        	else if (timetype == "1")
        	{
        		subindex = 16;
        		marginleft = -170;
        		pdf417left = 130;
        		if(!isopenwithwps){
        			marginleft = -170;
        			pdf417left = 20;
        		}
        	}
        	else if (timetype == "2")
        	{
        		subindex = 10;
        		marginleft = -120;
        		pdf417left = 105;
        		
        		if(!isopenwithwps){
        			marginleft = -120;
        			pdf417left = 20;
        		}
        		
        	}
        }
        
        if( exparam.printdata.imgmarginleft){
        	marginleft = exparam.printdata.imgmarginleft;
        }
        if( exparam.printdata.pdf417left){
        	pdf417left  =exparam.printdata.pdf417left;
        }
        
        var bool = false;
        var opinionusernameexp = exparam.printdata.opinionusernameexp; // 0 1 2 
       var opinionuserexpstr = exparam.printdata.opinionuserexpstr; //署名规则 [$top2orgname$-$username$]  [$toporgname$-$username$]
        var opdata = exparam.printdata.opiniondata;
        if(opdata){
        	
	        for (var key in opdata) {
	            if (myDocument.BookMarks.Exists(key)) {
	                myDocument.Bookmarks(key).Range.Select();
	                var arr = opdata[key];
	                for (var i = 0; i < arr.length; i++) {
	                    var op = arr[i];
	                    var strs = "";
	                    op.opinioncontent =  op.opinioncontent.replace(/\r\n/g,"\n");
	                    op.opinioncontent =  op.opinioncontent.replace(/\n/g,"\r\n");
	
	                    var contents = op.opinioncontent.split("\r\n");
	                    for (var j = 0; j < contents.length; j++) {
	                        if (contents[j] != null && contents[j] != "" && strs == "") {
	                            strs = "    " + contents[j].trim();
	                        } else if (contents[j] != null && contents[j] != "") {
	                            strs = strs + "\n" + "    " + contents[j].trim();//\r
	                        }
	                    }
	                    
	                    myDocApp.Selection.insertBefore(strs);
	                    myDocApp.Selection.InsertRowsBelow(1);
	                    myDocApp.Selection.Range.ParagraphFormat.Alignment = 2;
	                    if (myDocApp.ActiveDocument.Application.Selection && myDocApp.ActiveDocument.Application.Selection.Rows(1))
	                    {
	                		myDocApp.ActiveDocument.Application.Selection.Rows(1).cells(1).range.ParagraphFormat.LineSpacing = 24;
	                	}
	                    var str = "";
	                    var username = op.userflag;
	                    var handsign = LWFP.innerApi.SignImg.getSignImg(username);
	                    //timetype 0 就是全部 1 就说到分钟  2就是 日期
	                    var pdf417code = op.pdf417code;  //leapconfig.server + "LEAP/LOAP/Plugin/javascript/1598346453019.png";//
	                    // var pdf417code = leapconfig.server + "LEAP/LOAP/Plugin/javascript/1598346453019.png";//
	                    if (op.specialsign) {
	                        str = op.specialsign;
	                    } else if (handsign) {
	                        var handsign = JSON.parse(handsign.imguri);
	                        var localJPGPath = leapconfig.server + "LEAP/Download/" + handsign.nameedPath + "/" + handsign.name;
	                        myDocApp.ActiveDocument.Application.Selection.MoveLeft(1);
	                        //签名位置调整
	                       // activedocument.AddPicFromURL(localJPGPath, true, -110, 0, 1, 30, 1); // localJPGPath
	                        if (pdf417code) {
	                        	if(!bool){
	            					//marginleft = marginleft +100;
	            					bool = true;
	            				}
	                        }
	                        activedocument.AddPicFromURL(localJPGPath, true, marginleft, 0, 1, 35, 1); //localJPGPath
	                        var str = "  ";
	                        
	                        if (op.opiniontime && op.opiniontime.time) {
	                        	str = "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, subindex);
	                        }
	                       
	                        if (pdf417code) {
	                        	myDocApp.ActiveDocument.Application.Selection.Rows(1).cells(1).RightPadding = 90;
	                        	//1 135  2 105  0 150
	                        	activedocument.AddPicFromURL(pdf417code, true,pdf417left, 4, 1, 100, 1);
							}
	                        myDocApp.Selection.insertAfter("");
	                    } else {
	                    	if (op.opiniontime&&op.opiniontime.time) {
	                    		
	                    		if(opinionuserexpstr){
	                    			str = opinionuserexpstr.replace("$top2orgname$",op.top2orgname).replace("$toporgname$",op.toporgname).replace("$organname$",op.organname).replace("$username$",op.username)+ "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, subindex);
	                    		}else{
	                        		str = op.username + "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, subindex)+" ";
	                    		}
	                    		
	                        	//str = op.username + "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, subindex);
	                        }
	                        //str = op.username + "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, 16);;
	                    }
	                     
	                    myDocApp.Selection.insertBefore(str);
	                    myDocApp.Selection.InsertRowsBelow(1);
	                    if (myDocApp.ActiveDocument.Application.Selection && myDocApp.ActiveDocument.Application.Selection.Rows(1))
	                    {
	                    	myDocApp.ActiveDocument.Application.Selection.Rows(1).cells(1).RightPadding = 6;
	                    }
	                    myDocApp.Selection.Range.ParagraphFormat.Alignment = 0;
	                   
	                    myDocApp.Selection.Delete();
	                   
	                }
	                 myDocApp.Selection.MoveDown();
	                 //myDocApp.Selection.Rows.Delete();
	            }
	 			
	        }
        }
        var blqkdata = null;
        if(exparam.blqkdata){
        	blqkdata = exparam.blqkdata;
        }else{
        	 if (exparam.domain.workflow && exparam.domain.data) {
	            if (exparam.domain.data.wf_entry_id) {
	                blqkdata = LEAP.routerRequest("lbcp_getBLQK", {
	                    entryid: exparam.domain.data.wf_entry_id
	                });
	            }
	        }
        }
        if (blqkdata && myDocument.BookMarks.Exists("blqk")) {
            myDocument.Bookmarks("blqk").Range.Select();
            for (var i = 0; i < blqkdata.length; i++) {
                var op = blqkdata[i];
                var strs = "";
                var contents = op.opinioncontent.split("\r\n");
                for (var j = 0; j < contents.length; j++) {
                    if (contents[j] != null && contents[j] != "" && strs == "") {
                        strs = "    " + contents[j].trim();
                    } else if (contents[j] != null && contents[j] != "") {
                        strs = strs + "\n" + "    " + contents[j].trim();//\r
                    }
                }
                myDocApp.Selection.insertBefore(strs);
                myDocApp.Selection.InsertRowsBelow(1);
                myDocApp.Selection.Range.ParagraphFormat.Alignment = 2;

                var str = "";
                var username = op.userflag;
                var handsign = LWFP.innerApi.SignImg.getSignImg(username);
                if (op.specialsign) {
                    str = op.specialsign;
                } else if (handsign && dispApp) {
                    var handsign = JSON.parse(handsign.imguri);
                    var localJPGPath = leapconfig.server + "LEAP/Download/" + handsign.nameedPath + "/" + handsign.name;
                    var aa = myDocApp.ActiveDocument.Application.Selection.MoveLeft(1);
                  
                    if(!bool){
    					marginleft = marginleft +80;
    					bool = true;
    				}
                    //签名位置调整
                    activedocument.AddPicFromURL(localJPGPath, true, marginleft, 0, 1, 30, 1); //localJPGPath
                    var str = "  ";

                    str = "  " + op.opiniontime.substring(0, subindex);;
                    myDocApp.Selection.insertAfter("");
                } else {
                	if(opinionuserexpstr){
            			str = opinionuserexpstr.replace("$top2orgname$",op.top2orgname).replace("$toporgname$",op.toporgname).replace("$organname$",op.organname).replace("$username$",op.username)+ "  " + op.opiniontime.substring(0, 16);
            		}else{
                		str = op.username + "  " + op.opiniontime.substring(0, 16);
            		}
                	
                    //str = op.username + "  " + op.opiniontime.substring(0, 16);
                }
                myDocApp.Selection.insertBefore(str);
                myDocApp.Selection.InsertRowsBelow(1);
                myDocApp.Selection.Range.ParagraphFormat.Alignment = 0;
            }

        }

        //选择的领导批示
        if(exparam.printdata.selectldps && exparam.printdata.selectldpsline > 0){
        	if (exparam.printdata.selectldps && exparam.printdata.selectldps.length != 0) {
                var arr = exparam.printdata.selectldps;
                var p = exparam.printdata.selectldpsline;
                var table = myDocument.Tables(1);
                table.Rows(p).Select();
                myDocApp.Selection.InsertRowsBelow(arr.length * 2);
//              var newi = arr.length;
                for (var i = 0; i < arr.length; i++) {
//                	newi--;
                    var op = arr[i];
                    var row = table.rows(p + i * 2);
                    row.Cells.Merge();
                    row.cells(1).range.ParagraphFormat.Alignment = 0;
                    row.cells(1).range.ParagraphFormat.IndentFirstLineCharWidth(2);
                    var strs = "";
                    var contents = op.opinioncontent.split("\r\n");
                    for (var j = 0; j < contents.length; j++) {
                        if (contents[j] != null && contents[j] != "" && strs == "") {
                            if (i == 0) {
                                strs = contents[j].trim();
                            } else {
                                strs = contents[j].trim();
                            }
                        } else if (contents[j] != null && contents[j] != "") {
                            strs = strs + "\n"  + contents[j].trim();//\r
                        }
                    }
                    row.cells(1).range.insertAfter(strs);
                    var row = table.rows(p + i * 2 + 1);
                    row.Cells.Merge();
                    row.cells(1).range.ParagraphFormat.Alignment = 2;
                    row.cells(1).range.ParagraphFormat.LineSpacing = 24;
                    
                    //row.cells(1).RightPadding = 20;
                    
                    row.cells(1).range.ParagraphFormat.IndentFirstLineCharWidth(2);
                    var str = "";
                    var str = "";
                    var username = op.userflag;
                    var handsign = LWFP.innerApi.SignImg.getSignImg(username);
                    if (op.specialsign) {
                        str = op.specialsign;
                    } else if (handsign && dispApp) {
                        var handsign = JSON.parse(handsign.imguri);
                        var localJPGPath = leapconfig.server + "LEAP/Download/" + handsign.nameedPath + "/" + handsign.name;
                        row.cells(1).Select();
                        var aa = myDocApp.ActiveDocument.Application.Selection.MoveLeft(1);
                        // 签名位置调整
                        var img_showname = handsign.title;
						if(!bool){
        					marginleft = marginleft +80;
        					bool = true;
        				}
                        activedocument.AddPicFromURL(localJPGPath, true,marginleft, 0, 1, 30, 1); // localJPGPath
                        var str = "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, subindex);;
                        row.cells(1).range.insertAfter("");
                    } else {
                    	if(opinionuserexpstr){
	            			str = opinionuserexpstr.replace("$top2orgname$",op.top2orgname).replace("$toporgname$",op.toporgname).replace("$organname$",op.organname).replace("$username$",op.username)+ "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, subindex);
	            		}else{
	                		str = op.username + "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, subindex);
	            		}
                    	
                       // str = op.username + "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, subindex);;
                    }
                    row.cells(1).range.insertAfter(str);
                }
 				table.rows(table.rows.count).Select();
            	myDocApp.Selection.Rows.Delete();
            }
           
        }
        
        var ret = null;
        if(exparam.printdata.sqqkdata){
        	ret = exparam.printdata.sqqkdata;
        }else{
        	if(exparam.domain.data){
        		var id = exparam.domain.data.id;
	        	var par = new SearchParameters();
		        par.name = "lbcpfawensq";
		        par.addParameter("fwid", id, 11);
				par.addField("sqsj");
				par.addField("qpr");
				par.addField("fhsj");
		        par.setOrder("sqsj");
		        par.pageNum = 1;
				par.pageSize = 300;
		       	ret =  LEAP.routerRequest('beanSearch', {
		            par: par
		        });
        	}
        }
        if (ret && exparam.cellcount > 0 && exparam.cellcount > 0 && exparam.sqqkline >0) {
            var sqqkdata = LEAP.convertResult(ret);
            var table = myDocument.Tables(1);
            var bounds = Math.ceil(sqqkdata.length / exparam.cellcount);
            if (bounds > 1) {
                // 把首页的3行送签放到剪贴板
                table.Rows(exparam.sqqkline).Select();
                myDocApp.Selection.MoveEnd(exparam.cellcount + 1, 2);
                myDocApp.Selection.copy();
                for (var i = 1; i < bounds; i++) {
                    table.rows(i * 3 + exparam.sqqkline).Select();
                    myDocApp.Selection.paste();
                }
            }
            for (var i = 0; i < bounds; i++) {
                var __rowIdx = i * 3 + exparam.sqqkline;
                for (var k = 0; k < exparam.cellcount; k++) {
                    var __idx = i * exparam.cellcount + k;
                    if (__idx < sqqkdata.length) {
                        var sq = sqqkdata[__idx];
                        table.rows(__rowIdx).cells(k + 2).range.insertAfter(sq.sqsj.substring(5, 10));
                        table.rows(__rowIdx + 1).cells(k + 2).range.insertAfter(sq.qpr);
                        table.rows(__rowIdx + 2).cells(k + 2).range.insertAfter((sq.fhsj) ? sq.fhsj.substring(5, 10) : " ");
                    }
                }
            }
        }
        
        var isProtect = true;
        if (exparam.extendPar && exparam.extendPar.isProtect == false ) 
		{
			isProtect =  false;
		}
		if (null != exparam.domain.organsAllowedToEditWord) 
		{
			var usIf = LEAP.getUserInfo();
			var _organs = exparam.domain.organsAllowedToEditWord.split(",");
			for ( var i = 0; i < _organs.length; i++) 
			{
				if (usIf.orgCNName == _organs[i])// 当登录用户机构 与 配置机构一致开启编辑权限
				{
					isProtect = false;
					break;
				}
			}
		}
		if (isProtect) 
		{
			// 进行加密保护
			var psw = UUID.randomUUID().replaceall('-', '');
			myDocument.Protect(3, false, psw, false, false);// 常量：wdAllowOnlyReading=3;
		}
		// 文档设置加密 ********************************************************************
        
        return "123";
        
    } finally {
        myDocApp = myDocument = range = opinions = arr = table = i = op = row = k = sq = pagesCount = idx = rg = row = sqIdx = bonds = _idx = null;
    }

}


/**
 * 默认打印填充数据方法
 * @param {} myDocument
 * @param {} activedocument
 * @param {} exparam
 */
LBCP.DocumentView.afterOpenMyTemplate_iweboffice = function(myDocument, activedocument,exparam) {
    return LBCP.DocumentView.__afterOpenMyTemplate_iweboffice(null, true, myDocument, activedocument,exparam);
}
LBCP.DocumentView.__afterOpenMyTemplate_iweboffice = function(template, dispApp, myDocument, activedocument,exparam) {
    try {
        var imgtype = null; //二维码图片格式
        var myDocApp = null;
        if (myDocument == null) {
            myDocApp = new ActiveXObject("word.Application"); //mydocapp就是这个
            if (dispApp == true) myDocApp.Application.Visible = true;
            myDocument = myDocApp.Documents.Open(template);
        } else {
            myDocApp = myDocument.application;
        }
        var json = exparam.printdata;
        for (var key in json) {
            if (myDocument.BookMarks.Exists(key)) {
                myDocument.Bookmarks.Item(key).Range.InsertBefore(json[key]);
            }
        }
       
        var specilbookmarks = exparam.printdata.specialbookmarks;
        if(specilbookmarks){
        	 for (var key in specilbookmarks) {
	            if (myDocument.BookMarks.Exists(key)) {
	                myDocument.Bookmarks.Item(key).Range.InsertSymbol(82,"Wingdings 2");
	            }
	        }
        	
        }
        
        var timetype = exparam.printdata.opiniontimetype; // 0 1 2 \
        var opinionuserexpstr = exparam.printdata.opinionuserexpstr; //署名规则 [$top2orgname$-$username$]  [$toporgname$-$username$]
        var subindex = 16;
        var marginleft = 300;
        if (timetype != undefined)
        {
        	if (timetype == "0")
        	{
        		subindex = 19;
        		marginleft =280;
        	}
        	else if (timetype == "1")
        	{
        		subindex = 16;
        		marginleft = 300;
        	}
        	else if (timetype == "2")
        	{
        		subindex = 10;
        		marginleft = 320;
        	}
        }
        var opinionusernameexp = exparam.printdata.opinionusernameexp; // 0 1 2 
        var opdata = exparam.printdata.opiniondata;
        if(opdata){
	        for (var key in opdata) {
	            if (myDocument.BookMarks.Exists(key)) {
	                myDocument.Bookmarks.Item(key).Range.Select();
	                var arr = opdata[key];
	                for (var i = 0; i < arr.length; i++) {
	                    var op = arr[i];
	                    var strs = "";
	                    op.opinioncontent =  op.opinioncontent.replace(/\r\n/g,"\n");
	                    op.opinioncontent =  op.opinioncontent.replace(/\n/g,"\r\n");
	
	                    var contents = op.opinioncontent.split("\r\n");
	                    for (var j = 0; j < contents.length; j++) {
	                        if (contents[j] != null && contents[j] != "" && strs == "") {
	                            strs = "    " + contents[j].trim();
	                        } else if (contents[j] != null && contents[j] != "") {
	                            strs = strs + "\n" + "    " + contents[j].trim();//\r
	                        }
	                    }
	                    
	                    myDocApp.Selection.InsertBefore(strs);
	                    myDocApp.Selection.InsertRowsBelow(1);
	                    myDocApp.Selection.Range.ParagraphFormat.Alignment = 2;
	                    if (myDocApp.ActiveDocument.Application.Selection && myDocApp.ActiveDocument.Application.Selection.Rows.Item(1))
	                    {
	                		myDocApp.ActiveDocument.Application.Selection.Rows.Item(1).Cells.Item(1).Range.ParagraphFormat.LineSpacing = 24;
	                	}
	                    var str = "";
	                    var username = op.userflag;
	                    var handsign = LWFP.innerApi.SignImg.getSignImg(username);
	                    //timetype 0 就是全部 1 就说到分钟  2就是 日期
	                    if(!timetype){
	                    	timetype = op.timetype;
	                    }
	                    var pdf417code = op.pdf417code;
	                  //  var subindex = 16;
	                   // var marginleft = -170;
	                    if (timetype != undefined)
	                    {
	                    	if (timetype == "0")
	                    	{
	                    		subindex = 19;
	                    		marginleft = 280;
	                    	}
	                    	else if (timetype == "1")
	                    	{
	                    		subindex = 16;
	                    		marginleft = 300;
	                    	}
	                    	else if (timetype == "2")
	                    	{
	                    		subindex = 10;
	                    		marginleft = 320;
	                    	}
	                    }
	                    
	                    if (op.specialsign) {
	                        str = op.specialsign;
	                    } else if (handsign) {
	                        var handsign = JSON.parse(handsign.imguri);
	                        var localJPGPath = leapconfig.server + "LEAP/Download/" + handsign.nameedPath + "/" + handsign.name;
	                        myDocApp.ActiveDocument.Application.Selection.MoveLeft(1);
	            			if (pdf417code) {
	            				myDocApp.ActiveDocument.Application.Selection.Rows.Item(1).Cells.Item(1).RightPadding = 90;
	            			}
	                        //签名位置调整
	                       // activedocument.AddPicFromURL(localJPGPath, true, -110, 0, 1, 30, 1); // localJPGPath
	                         var  inlineshape = myDocApp.Selection.InlineShapes.AddPicture(localJPGPath, false, true);
		                        inlineshape.ScaleHeight = 20;
		                        inlineshape.ScaleWidth = 20;
		                      	var shape = inlineshape.ConvertToShape();
		                        shape.ShapeStyle = 1;
		                        shape.Left = marginleft;
		                        shape.Top = 0;
	            			
	                        //activedocument.AddPicFromURL(localJPGPath, true, marginleft, 0, 1, 30, 1); //localJPGPath
	                        var str = "  ";
	                        
	                        if (op.opiniontime && op.opiniontime.time) {
	                        	str = "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, subindex);
	                        }
	                        if (pdf417code) {
	                        	 var  inlineshape = myDocApp.Selection.InlineShapes.AddPicture(pdf417code, false, true);
		                        inlineshape.ScaleHeight = 20;
		                        inlineshape.ScaleWidth = 20;
		                      	var shape = inlineshape.ConvertToShape();
		                        shape.ShapeStyle = 1;
		                        shape.Left = 20;
		                        shape.Top = 0;
	                        	//activedocument.AddPicFromURL(pdf417code, true, 20, 4, 1, 100, 1);
							}
	                        myDocApp.Selection.InsertAfter("");
	                    } else {
	                    	if (op.opiniontime&&op.opiniontime.time) {
	                    		
	                    		if(opinionuserexpstr){
			            			str = opinionuserexpstr.replace("$top2orgname$",op.top2orgname).replace("$toporgname$",op.toporgname).replace("$organname$",op.organname).replace("$username$",op.username)+ "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, subindex);
			            		}else{
			                		str = op.username + "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, subindex)+" ";
			            		}
	                    		
	                        	//str = op.username + "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, subindex);
	                        }
	                        //str = op.username + "  " + LEAP.formatdate(op.opiniontime.time, 0).substring(0, 16);;
	                    }
	                     
	                    myDocApp.Selection.InsertBefore(str);
	                    myDocApp.Selection.InsertRowsBelow(1);
	                    if (myDocApp.ActiveDocument.Application.Selection && myDocApp.ActiveDocument.Application.Selection.Rows.Item(1))
	                    {
	                    	myDocApp.ActiveDocument.Application.Selection.Rows.Item(1).Cells.Item(1).RightPadding = 6;
	                    }
	                    myDocApp.Selection.Range.ParagraphFormat.Alignment = 0;
	                   
	                   // myDocApp.Selection.Delete();
	                   
	                }
	                // myDocApp.Selection.MoveDown();
	                 myDocApp.Selection.Rows.Delete();
	            }
	 			
	        }
        }
        var blqkdata = null;
        if(exparam.blqkdata){
        	blqkdata = exparam.blqkdata;
        }else{
        	 if (exparam.domain.workflow && exparam.domain.data) {
	            if (exparam.domain.data.wf_entry_id) {
	                blqkdata = LEAP.routerRequest("lbcp_getBLQK", {
	                    entryid: exparam.domain.data.wf_entry_id
	                });
	            }
	        }
        }
        if (blqkdata && myDocument.BookMarks.Exists("blqk")) {
            myDocument.Bookmarks.Item("blqk").Range.Select();
            for (var i = 0; i < blqkdata.length; i++) {
                var op = blqkdata[i];
                var strs = "";
                var contents = op.opinioncontent.split("\r\n");
                for (var j = 0; j < contents.length; j++) {
                    if (contents[j] != null && contents[j] != "" && strs == "") {
                        strs = "    " + contents[j].trim();
                    } else if (contents[j] != null && contents[j] != "") {
                        strs = strs + "\n" + "    " + contents[j].trim();//\r
                    }
                }
                myDocApp.Selection.InsertBefore(strs);
                myDocApp.Selection.InsertRowsBelow(1);
                myDocApp.Selection.Range.ParagraphFormat.Alignment = 2;

                var str = "";
                var username = op.userflag;
                var handsign = LWFP.innerApi.SignImg.getSignImg(username);
                if (op.specialsign) {
                    str = op.specialsign;
                } else if (handsign && dispApp) {
                    var handsign = JSON.parse(handsign.imguri);
                    var localJPGPath = leapconfig.server + "LEAP/Download/" + handsign.nameedPath + "/" + handsign.name;
                    var aa = myDocApp.ActiveDocument.Application.Selection.MoveLeft(1);
                    //签名位置调整
                     var  inlineshape = myDocApp.Selection.InlineShapes.AddPicture(localJPGPath, false, true);
                        inlineshape.ScaleHeight = 20;
                        inlineshape.ScaleWidth = 20;
                      	var shape = inlineshape.ConvertToShape();
                        shape.ShapeStyle = 1;
                        shape.Left = marginleft;
                        shape.Top = 0;
                    
                   // activedocument.AddPicFromURL(localJPGPath, true, -170, 0, 1, 50, 1); //localJPGPath
                    var str = "  ";

                    str = "  " + op.opiniontime.substring(0, 16);;
                    myDocApp.Selection.insertAfter("");
                } else {
                	if(opinionuserexpstr){
            			str = opinionuserexpstr.replace("$top2orgname$",op.top2orgname).replace("$toporgname$",op.toporgname).replace("$organname$",op.organname).replace("$username$",op.username)+ "  " +  op.opiniontime.substring(0, 16);
            		}else{
                		str = op.username + "  " +  op.opiniontime.substring(0, 16);
            		}
                   // str = op.username + "  " + op.opiniontime.substring(0, 16);
                }
                myDocApp.Selection.InsertBefore(str);
                myDocApp.Selection.InsertRowsBelow(1);
                myDocApp.Selection.Range.ParagraphFormat.Alignment = 0;
            }

        }

        //选择的领导批示
        if(exparam.printdata.selectldps && exparam.printdata.selectldpsline > 0){
        	if (exparam.printdata.selectldps && exparam.printdata.selectldps.length != 0) {
                var arr = exparam.printdata.selectldps;
                var p = exparam.printdata.selectldpsline;
                var table = myDocument.Tables.Item(1);
                table.Rows.Item(p).Select();
                myDocApp.Selection.InsertRowsBelow(arr.length * 2);
//              var newi = arr.length;
                for (var i = 0; i < arr.length; i++) {
//                	newi--;
                    var op = arr[i];
                    var row = table.Rows.Item(p + i * 2);
                    row.Cells.Merge();
                    row.Cells.Item(1).Range.ParagraphFormat.Alignment = 0;
                    row.Cells.Item(1).Range.ParagraphFormat.IndentFirstLineCharWidth(2);
                    var strs = "";
                    var contents = op.opinioncontent.split("\r\n");
                    for (var j = 0; j < contents.length; j++) {
                        if (contents[j] != null && contents[j] != "" && strs == "") {
                            if (i == 0) {
                                strs = contents[j].trim();
                            } else {
                                strs = contents[j].trim();
                            }
                        } else if (contents[j] != null && contents[j] != "") {
                            strs = strs + "\n"  + contents[j].trim();//\r
                        }
                    }
                    row.Cells.Item(1).Range.InsertAfter(strs);
                    var row = table.Rows.Item(p + i * 2 + 1);
                    //row.Cells.Merge();
                    row.Cells.Item(1).Range.ParagraphFormat.Alignment = 2;
                    row.Cells.Item(1).Range.ParagraphFormat.LineSpacing = 24;
                    
                    //row.cells(1).RightPadding = 20;
                    
                    row.Cells.Item(1).Range.ParagraphFormat.IndentFirstLineCharWidth(2);
                    var str = "";
                    var str = "";
                    var username = op.userflag;
                    var handsign = LWFP.innerApi.SignImg.getSignImg(username);
                    if (op.specialsign) {
                        str = op.specialsign;
                    } else if (handsign && dispApp) {
                        var handsign = JSON.parse(handsign.imguri);
                        var localJPGPath = leapconfig.server + "LEAP/Download/" + handsign.nameedPath + "/" + handsign.name;
                        row.Cells.Item(1).Select();
                        var aa = myDocApp.ActiveDocument.Application.Selection.MoveLeft(1);
                        // 签名位置调整
                        var img_showname = handsign.title;
 						var  inlineshape = myDocApp.Selection.InlineShapes.AddPicture(localJPGPath, false, true);
                        inlineshape.ScaleHeight = 20;
                        inlineshape.ScaleWidth = 20;
                      	var shape = inlineshape.ConvertToShape();
                        shape.ShapeStyle = 1;
                        shape.Left = marginleft;
                        shape.Top = 0;
                       // activedocument.AddPicFromURL(localJPGPath, true, -110, 0, 1, 30, 1); // localJPGPath
                        var str = "  " + LEAP.formatdate(op.opiniontime.time, 1);
                        row.Cells.Item(1).range.InsertAfter("");
                    } else {
                    	if(opinionuserexpstr){
	            			str = opinionuserexpstr.replace("$top2orgname$",op.top2orgname).replace("$toporgname$",op.toporgname).replace("$organname$",op.organname).replace("$username$",op.username)+ "  " + LEAP.formatdate(op.opiniontime.time, 1);
	            		}else{
	                		str = op.username + "  " + LEAP.formatdate(op.opiniontime.time, 1);
	            		}
                    	
                       // str = op.username + "  " + LEAP.formatdate(op.opiniontime.time, 1);
                    }
                    row.Cells.Item(1).Range.InsertAfter(str);
                }
  				table.Rows.Item(table.Rows.Count).Select();
           		myDocApp.Selection.Rows.Delete();
            }
          
        }
        
        var ret = null;
        if(exparam.printdata.sqqkdata){
        	ret = exparam.printdata.sqqkdata;
        }else{
        	if(exparam.domain.data){
        		var id = exparam.domain.data.id;
	        	var par = new SearchParameters();
		        par.name = "lbcpfawensq";
		        par.addParameter("fwid", id, 11);
				par.addField("sqsj");
				par.addField("qpr");
				par.addField("fhsj");
		        par.setOrder("sqsj");
		        par.pageNum = 1;
				par.pageSize = 300;
		       	ret =  LEAP.routerRequest('beanSearch', {
		            par: par
		        });
        	}
        }
        if (ret && exparam.cellcount > 0 && exparam.cellcount > 0 && exparam.sqqkline >0) {
            var sqqkdata = LEAP.convertResult(ret);
            var table = myDocument.Tables.Item(1);
            var bounds = Math.ceil(sqqkdata.length / exparam.cellcount);
            if (bounds > 1) {
                // 把首页的3行送签放到剪贴板
                table.Rows.Item(exparam.sqqkline).Select();
                myDocApp.Selection.MoveEnd(exparam.cellcount + 1, 2);
                myDocApp.Selection.Copy();
                for (var i = 1; i < bounds; i++) {
                    table.Rows.Item(i * 3 + exparam.sqqkline).Select();
                    myDocApp.Selection.Paste();
                }
            }
            for (var i = 0; i < bounds; i++) {
                var __rowIdx = i * 3 + exparam.sqqkline;
                for (var k = 0; k < exparam.cellcount; k++) {
                    var __idx = i * exparam.cellcount + k;
                    if (__idx < sqqkdata.length) {
                        var sq = sqqkdata[__idx];
                        table.Rows.Item(__rowIdx).Cells.Item(k + 2).Range.InsertAfter(sq.sqsj.substring(5, 10));
                        table.Rows.Item(__rowIdx + 1).Cells.Item(k + 2).Range.InsertAfter(sq.qpr);
                        table.Rows.Item(__rowIdx + 2).Cells.Item(k + 2).Range.InsertAfter((sq.fhsj) ? sq.fhsj.substring(5, 10) : " ");
                    }
                }
            }
        }
        
        var isProtect = true;
        if (exparam.extendPar && exparam.extendPar.isProtect == false ) 
		{
			isProtect =  false;
		}
		if (null != exparam.domain.organsAllowedToEditWord) 
		{
			var usIf = LEAP.getUserInfo();
			var _organs = exparam.domain.organsAllowedToEditWord.split(",");
			for ( var i = 0; i < _organs.length; i++) 
			{
				if (usIf.orgCNName == _organs[i])// 当登录用户机构 与 配置机构一致开启编辑权限
				{
					isProtect = false;
					break;
				}
			}
		}
		if (isProtect) 
		{
			// 进行加密保护
			var psw = UUID.randomUUID().replaceall('-', '');
			myDocument.Protect(3, false, psw, false, false);// 常量：wdAllowOnlyReading=3;
		}
		// 文档设置加密 ********************************************************************
        
        return "123";
        
    } finally {
        myDocApp = myDocument = range = opinions = arr = table = i = op = row = k = sq = pagesCount = idx = rg = row = sqIdx = bonds = _idx = null;
    }

}


/***********************************模板书签填值打印************************************************/

/***********************************模板书签填值转pdf************************************************/

LBCP.DocumentView.initconvertPDFOrOFD = function(domain, url, printdata, cellcount, sqqkline,extendPar){
	
	if(url.indexof("http:") == -1 && url.indexof("https:")== -1){
		url = leapconfig.server   + url;
	}
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		LBCP.DocumentView.initconvert_btn_wpsAddon(domain, url, printdata, cellcount, sqqkline,extendPar);
	}else{
		LBCP.DocumentView.initconvert_btn_nkoffice(domain, url, printdata, cellcount, sqqkline,extendPar);
	}
}

/**
 * 转换word文档
 * @param {} domain
 * @param {} url
 * @param {} printdata
 * @param {} cellcount
 * @param {} sqqkline
 * @param {} extendPar
 */
LBCP.DocumentView.convertWord = function( url,extendPar,domain){
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		LBCP.DocumentView.initconvert_btn_wpsAddon(domain, url, {"temp":"123"}, 0, 0,extendPar);
	}else{
		LBCP.DocumentView.initconvert_btn_nkoffice(domain, url, {"temp":"123"}, 0, 0,extendPar);
	}
}



LBCP.DocumentView.initconvert_btn_nkoffice = function(domain, url, printdata, cellcount, sqqkline,extendPar){
    var  buttons = extendPar.buttons;
    var  fromtitle = extendPar.fromtitle;
	if(!buttons){
		buttons = "ConvertPDF";
	}
	if(!fromtitle){
		fromtitle = '领导批示PDF转换页';
	}
	var afterloadfn = LBCP.DocumentView.afterOpenMyTemplate_nkoffice;
    if(LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
  		afterloadfn = LBCP.DocumentView.afterOpenMyTemplate_iweboffice;
    }
	var _form = domain.loadForm('loapwordviewer', fromtitle);
        LEAP.form.maxSize(_form.form);
        var par = {
            url: url,//模板地址
            buttons:buttons,//显示的按钮
            afterload: afterloadfn,//文档加载完调用
            pdfcallbackFn:extendPar.callbackfn, //转pdf回调函数
            doccallbackFn:extendPar.doccallbackfn,//转word文档上传
            autotranspdf: extendPar.autotranspdf?extendPar.autotranspdf:false, //是否自动转pdf
            exparam:{domain:domain,printdata:printdata,cellcount:cellcount,sqqkline:sqqkline,extendPar:extendPar}
           
        };
        LEAP.asyn(_form.module.init, _form.module, 500, par, domain);
}


/**
 * word模板转pdf或ofd
 * @param {} domain 作用域
 * @param {} url 模板路径
 * @param {} printdata  填充的数据值 
 * @param {} cellcount 送签情况列数
 * @param {} sqqkline  送签情况所在行数
 * @param {} converttype 转版类型 pdf ofd
 */
LBCP.DocumentView.initconvert_btn_wpsAddon = function(domain, url, printdata, cellcount, sqqkline,extendPar){
	if(printdata == null || url == null || "" == url || "" == printdata ){
		return;
	}
	//处理数据数据
	//获取签名图片
	var opdata =  printdata.opiniondata;
	if(opdata){
		 for (var key in opdata) {
	       if(printdata.opiniondata[key]){
			 	for (var i = 0; i < printdata.opiniondata[key].length; i++) {
			 		 if (printdata.opiniondata[key][i].opiniontime && printdata.opiniondata[key][i].opiniontime.time) {
			 			printdata.opiniondata[key][i].optimes = LEAP.formatdate(printdata.opiniondata[key][i].opiniontime.time, 0);
			 		 }
		             var username = printdata.opiniondata[key][i].userflag;
		             var handsign_t = LWFP.innerApi.SignImg.getSignImg(username);
		        	 if(handsign_t){
			             var handsign = JSON.parse(handsign_t.imguri);
			             var localJPGPath = leapconfig.server + "LEAP/Download/" + handsign.nameedPath + "/" + handsign.name;
			             printdata.opiniondata[key][i].handsign = localJPGPath;
			            // printdata.opiniondata[key][i].pdf417code = leapconfig.server + "LEAP/LOAP/Plugin/javascript/1598346453019.png";

		        	 }
		        }
	       }
		 }
	}
	var sqqkdata = null;
	if(printdata.sqqkdata){
		//获取sqqk
		sqqkdata =  LEAP.convertResult(printdata.sqqkdata);
	}
	//获取办理情况 
	var blqkdata = null;
	if(printdata.blqkdata){
		blqkdata = printdata.blqkdata;
		if(blqkdata){
        	 for (var i = 0; i < blqkdata.length; i++) {
        	 	 if (blqkdata[i].opiniontime && blqkdata[i].opiniontime.time) {
		 			blqkdata[i].optimes = LEAP.formatdate(blqkdata[i].opiniontime.time, 0);
		 		 }
	             var username = blqkdata[i].userflag;
	             var handsign_t = LWFP.innerApi.SignImg.getSignImg(username);
	        	 if(handsign_t){
		             var handsign = JSON.parse(handsign_t.imguri);
		             var localJPGPath = leapconfig.server + "LEAP/Download/" + handsign.nameedPath + "/" + handsign.name;
		             blqkdata[i].handsign = localJPGPath;
	        	 }
	        }
        }
	}
	
	if(printdata.selectldps && printdata.selectldps.length >0){
    	 for (var i = 0; i < printdata.selectldps.length; i++) {
    	 	 if (printdata.selectldps[i].opiniontime && printdata.selectldps[i].opiniontime.time) {
	 			printdata.selectldps[i].optimes = LEAP.formatdate(printdata.selectldps[i].opiniontime.time, 0);
	 		 }
             var username = printdata.selectldps[i].userflag;
             var handsign_t = LWFP.innerApi.SignImg.getSignImg(username);
        	 if(handsign_t){
	             var handsign = JSON.parse(handsign_t.imguri);
	             var localJPGPath = leapconfig.server + "LEAP/Download/" + handsign.nameedPath + "/" + handsign.name;
	             printdata.selectldps[i].handsign = localJPGPath;
        	 }
        }
	}
	var buttons = [{id:"customButton_2", label:"转为pdf并上传", icon:"../../testcase/btn_pdf.svg", fn:"LBCP.DocumentView.convert_PDF_Upload"},
				   {id:"customButton_3", label:"转为ofd并上传", icon:"../../testcase/btn_ofd.svg", fn:"LBCP.DocumentView.convert_OFD_Upload"}];
	var callbackfn =  extendPar.callbackfn;
	if(extendPar.convert){
		if(extendPar.convert == "pdf"){
			buttons = [{id:"customButton_2", label:"转为pdf并上传", icon:"../../testcase/btn_pdf.svg", fn:"LBCP.DocumentView.convert_PDF_Upload"}];
		}else if(extendPar.convert == "ofd"){
			buttons = [{id:"customButton_3", label:"转为ofd并上传", icon:"../../testcase/btn_ofd.svg", fn:"LBCP.DocumentView.convert_OFD_Upload"}];
		}else if(extendPar.convert == "save"){
			buttons = [{id:"customButton_1", label:"上传当前word文档", icon:"../../testcase/btn_save.svg", fn:"LBCP.DocumentView.saveAndUpload"}];
			callbackfn = extendPar.doccallbackfn;
		}
	}
	
	if(printdata.useurl){//数据较多的情况下，国产环境数据传递异常时使用
		//将数据存入到数据库中		
		var bean ={};
		var uuid = UUID.randomUUID().replaceall('-', '');
		bean.beanname = "lbcpannotationbureau";//借用数据表
		bean.id = uuid;
		bean.content = JSON.stringify(printdata);
		var bool = LEAP.routerRequest('lbcp_beanInsert', {
	        bean: bean
	    });
	    if(!bool){	    	
	    	return;
	    }
	    var dataurl = {url:leapconfig.server+"restservices/lbcprest/lbcp_rest_getPrintData/query",id:uuid};
		//二次传参 通过url获取数据
		printdata = {fwbt:printdata.fwbt,dataurl:dataurl}
	}
	
	if(url.indexof("?")!=-1){
		if(url.indexof("sid=") ==-1){
			url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
	}else{
		url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
	}
	
	var param = {docType:LEAP.WPSAddon.docType.wps,
				docId: UUID.randomUUID(),
			    fileTitle: printdata.fwbt,
			    isnew: false,
			    fileName: url,
			    converAlert: "版式文件转换成功，请回到系统页面查看",
			    savePath: leapconfig.server,//绕过判断使用 不保存
			    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
			    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
			    customAfterOpenFn: "LBCP.DocumentView.afterOpenMyTemplate_wpsAddon", 
			    hideDefaultButtons:true,
			    //buttons: "submit,saveAs,showMark,hideMark,importDoc,taohong,safeDoc,deleteSafe,ConvertPDF,ConvertOFD",
			    customButtons: buttons,
			    waterMark: leapconfig.server + LEAP.getWaterMark(),
			    exparam:{convertPar:{actionname:extendPar.actionname,instance:domain.instance},EntityBeans:{printdata:printdata,cellcount:cellcount,sqqkline:sqqkline,blqkdata:blqkdata,sqqkdata:sqqkdata}},
				notifyFn:callbackfn,
				domain:domain
				};
				
	LEAP.WPSAddon.OpenDocument(param);
}



	
/***********************************模板书签填值转pdf************************************************/
LBCP.DocumentView.openAttFile = function(attfileinfo,domain){
	if (!attfileinfo && attfileinfo.filedata) {
		return;
	}
	var data =  attfileinfo.filedata;
	if(data.isedit == undefined || data.isedit == null || data.entryid){
		data.isedit = false;
		data.canEdit = false;
	}
	
	var _ex = /\.[^\.]+/.exec(data.name);					
	var wpsAddon = {ifwps:false, type:null};
	if (_ex && (_ex[0] == '.doc' || _ex[0] == '.docx' || _ex[0] == '.wps'))
		wpsAddon = {ifwps:true, type:"wps"};
	else if (_ex && (_ex[0] == '.xls' || _ex[0] == '.xlsx' || _ex[0] == '.et'))
		wpsAddon = {ifwps:true, type:"et"};
	else if (_ex && (_ex[0] == '.ppt' || _ex[0] == '.pptx'))
		wpsAddon = {ifwps:true, type:"wpp"};
	
	if(!data.namedpath){
		data.namedpath = data.nameedPath;
	}
	if((wpsAddon.ifwps == true && LEAP.WPSAddon && LEAP.WPSAddon.AddonEnable[wpsAddon.type] == true) && ((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon"))){
		
		//"submit,saveAs,print"
		var buttons = "saveAs,print";
		if(data.isedit){
			buttons = "submit,saveAs,print";
		}
		var pathurl = LEAP.upload.getPath(data.namedpath, data.name, null);
		if(data.fileid){
	   		pathurl = pathurl +"?fileid=" + data.fileid;
	   	}
		var p = "sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() +  "&wflog=1&terminal=0";
		if (pathurl.indexOf('?') == -1)	
			pathurl += "?" + p;
		else
			pathurl += "&" + p;
		
		var savepath = leapconfig.server + "logic/WFOffice_updateDoc?lcors=1&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&namedpath=" + encodeURIComponent(data.namedpath) + "&name=" + encodeURIComponent(data.name) + ((data.fileid==null) ? "" : "&fileid=" + data.fileid);

		var param = {docType: wpsAddon.type,
					docId: ((data.id) ? data.id : "non"+new Date().getTime()),
				    isnew: false,
				    readOnly: !data.isedit,
				    atttype:	0,
				    fileTitle: data.title,
				    buttons : buttons,
				    fileName: 	pathurl,
				    waterMark: leapconfig.server + LEAP.getWaterMark(),
				    savePath: savepath,//leapconfig.server  + "logic/WFOffice_updateDoc?namedpath=" + encodeURIComponent(data.namedpath) + "&name=" + data.name + ((data.fileid==null) ? "" : "fileid=" + data.fileid),
				    uploadPath: leapconfig.server  + "logic/WFOffice_updateDoc2?uploadpath=default",
				    exparam:	null,
				    domain:		domain,
				    notifyFn: 	null
				  };
		if (LEAP.attlist.attachment_acceptRevisions == true)
		{
			param.acceptRevisions = true;
		}	
		LEAP.WPSAddon.OpenDocument(param);
	}else{
		var atttype = "";
		var _ex = /\.[^\.]+/.exec(data.name.toLowerCase());					
		if (_ex && (_ex[0] == '.doc' || _ex[0] == '.docx' || _ex[0] == '.xls' || _ex[0] == '.xlsx' || _ex[0] == '.ppt' || _ex[0] == '.pptx'))
		{
			atttype = -12356;
		}
		if( _ex[0] == '.wps'){
			atttype =  -12356;
		}
		if(_ex[0] == '.pdf')
		{
			atttype = -12356;
		}
		var ifOFD = false;
		if(_ex[0] == '.ofd')
		{
			ifOFD = true;
			atttype = -12356;
		}
		if(atttype == ""){
			var urlt = LEAP.upload.getPath(data.namedpath, data.name, null,data.showName,data.title);
			if(data.fileid){
		   		urlt = urlt +"?fileid=" + data.fileid;
		   	}
			
			window.open(urlt);
			return;
		}
		
		
		if (ifOFD == true && LEAP.DocumentView.OfdDocumentEditor == "suwellreader" 	&& ((LEAP.DocumentView.OfdOpenType_win == "suwellreaderUrlProtocol" && LEAP.DocumentView.isWin == true)	|| (LEAP.DocumentView.OfdOpenType_linux == "suwellreaderUrlProtocol" && LEAP.DocumentView.isWin == false)) )
		{//数科阅读器，并且用协议拉起
			LBCP.DocumentView._openOfd_urlProtocol(domain, data);
			return;
		}
		else if (ifOFD == true && LEAP.DocumentView.OfdDocumentEditor == "suwellreader" && ((LEAP.DocumentView.OfdOpenType_win == "suwellreaderJsAPI" && LEAP.DocumentView.isWin == true) || (LEAP.DocumentView.OfdOpenType_linux == "suwellreaderJsAPI" && LEAP.DocumentView.isWin == false)) )
		{//数科阅读器，并且用jsapi拉起
			LBCP.DocumentView._openOfd_JsAPI(domain, data);
			return;
		}
		
		
		
		
		if (_ex[0] == '.pdf' &&(LEAP.DocumentView.isWin == true && LEAP.DocumentView.PdfDocumentEditor_win == "browserPlugin") || (LEAP.DocumentView.isWin == false && LEAP.DocumentView.PdfDocumentEditor_linux == "browserPlugin"))
		{
			var urlt = LEAP.upload.getPath(data.namedpath, data.name, null,data.showName,data.title);
			if(data.fileid){
		   		urlt = urlt +"?fileid=" + data.fileid;
		   	}
			//直接打开
			if(urlt.indexOf("?") != -1){
				window.open(urlt +"&open=1");
			}else{
				window.open(urlt +"?open=1");
			}
			return;
		}
		/*if (_ex[0] == '.ofd' && LEAP.DocumentView.OfdDocumentEditor == "suwellreader"  && ((LEAP.DocumentView.OfdOpenType_win == "suwellreaderUrlProtocol" && LEAP.DocumentView.isWin == true) || (LEAP.DocumentView.OfdOpenType_linux == "suwellreaderUrlProtocol" && LEAP.DocumentView.isWin == false)) )
		{
			LEAP.attlist._openOfd_urlProtocol(element, att);
			return;
		}*/
		
		var bean = {};
		var url = leapconfig.server + "LEAP/LWFP/HTML/DocumentViewer/DocumentViewer.html";
		bean.key = data.name.replace(".","");
		bean.url = url;
		 var _att = {};
		_att.atttype = atttype;
		_att.title = data.showName; 
		_att.name = data.name;
		if(data.namedpath){
			_att.namedpath =  data.namedpath;
		}else{
			_att.namedpath =  data.nameedPath;
		}
		_att.updateType = 0;
		_att.canDelete = false;
		_att.canEdit = data.isedit;
		if(_att.fileid){
			_att.fileid = data.fileid;
		}
		bean.par = {a:"", b:_att};
		if(data.isedit){
			bean.getParamFn = LBCP.DocumentView.getParamFn2;
		}else{
			bean.getParamFn = LBCP.DocumentView.getParamFn;
		}
		
		bean.callbackFn = null;
		LWFP.windowOpen.Open(bean);
		
	}
}
 

LBCP.DocumentView._openOfd_JsAPI = function(module, att)
{
	//var module = LWFP.innerApi.getmodule(element);
	var url = LEAP.upload.getPath(att.namedpath, att.name, att.uuid, null, null, null, null, att.fileid, ((module && module.leapclient) ? module.leapclient.router:null));
	if (url.indexOf('?') == -1)	
		url += "?lcors=1";
	else
		url += "&lcors=1";	
		
	var p = "&sid=" +leapclient.getsid() + LEAP.wfrouter.getLid() + "&wflog=1&terminal=0";
	url += p;
	
	
	var saveurl = LEAP.wfrouter.getServerURL(LEAP.wfrouter.getRouter(module)) + 'logic/WFOffice_updateDoc_ofd?' 
					+ 'namedpath=' + att.namedpath + '&name=' + att.name;
	if (att.fileid)
		saveurl += "&fileid=" + att.fileid;	
	
	saveurl +="&sid=" +leapclient.getsid() + LEAP.wfrouter.getLid();
		
	var param = {open_url:url, save_url:saveurl, readOnly:!att.canEdit};
	LEAP.OFD.OpenUrlFile(param);
	
}

LBCP.DocumentView._openOfd_urlProtocol = function(module, att)
{
	var url = LEAP.upload.getPath(att.namedpath, att.name, att.uuid, null, null, null, null, att.fileid, ((module && module.leapclient) ? module.leapclient.router:null));
	if (url.indexOf('?') == -1)	
	{
		url += "?lcors=1";
	}else
	{
		url += "&lcors=1";	
	}
	var p = "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid()+ "&wflog=1&terminal=0";
	url += p;
	
	
	var saveurl = LEAP.wfrouter.getServerURL(LEAP.wfrouter.getRouter(module)) + 'logic/WFOffice_updateDoc_ofd?' 	+ 'namedpath=' + att.namedpath + '&name=' + att.name;
	if (att.fileid)
		saveurl += "&fileid=" + att.fileid;	
		
	saveurl += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
	
	var portocolUrl = "";
	if (att.canEdit == true)
	{
		portocolUrl = "suwellofd://" + url + "?saveurl=" + saveurl + "&comopisteinvisble=f_open";
	}
	else
	{
		portocolUrl = "suwellofd://" + url + "?saveurl=s?id=0&comopisteinvisble=f_save";
	}

	LBCP.DocumentView.frameRequest(portocolUrl);					
}


LBCP.DocumentView.frameRequest = function(requestUrl)
{
	try
	{
		var iframe = document.getElementById("____attlist_frameRequest___");
		if (!iframe)
		{		
			iframe = document.createElement('iframe');
			iframe.setAttribute("id", "____attlist_frameRequest___");
			iframe.style.position = "absolute";
			iframe.style.top = "0px";
			iframe.style.left = "0px";
			
			var f = true;
				
			if (f)
			{
				iframe.style.width = "1px";
				iframe.style.height = "1px";
				iframe.style.zIndex = -1;
			}
			
			document.body.appendChild(iframe);
		}
			    
	    iframe.src = requestUrl;	
	}
	finally
	{
		iframe = f = null;
	}
}






LBCP.DocumentView.getParamFn = function(arg, arg2)
{
	if (arg.paramName  == 	"wordparam")
	{	//获取word编辑相关参数
		return {wordButton:"saveAs,print"};
	}
	else if (arg.paramName == "attachment")
	{  //获取要打开的附件对象
		return arg2.b;			
	}
}
LBCP.DocumentView.getParamFn2 = function(arg, arg2)
{
	if (arg.paramName  == 	"wordparam")
	{	//获取word编辑相关参数
		return {wordButton:"submit,saveAs,print"};
	}
	else if (arg.paramName == "attachment")
	{  //获取要打开的附件对象
		return arg2.b;			
	}
}
	

/***********************************业务特殊处理逻辑**********************************************/
/**
 * 
 * @param {} configdata
 * @param {} resultdata
 * @param {} domain
 */
LBCP.DocumentView.ZWAPExportWord = function(url,tempdata,configdata,resultdata,domain){
	//url = leapconfig.server   + url;
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		
		if(url.indexof("?")!=-1){
			if(url.indexof("sid=") ==-1){
				url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
			}
		}else{
			url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
		
		var param = {docType:LEAP.WPSAddon.docType.wps,
					docId: UUID.randomUUID(),
				    fileTitle: tempdata.exporttitle,
				    fileName: url,
				    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
				    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
				    customAfterOpenFn: "LBCP.DocumentView.afterOpenZWAPTemplete_wpsAddon", 
				    //hideDefaultButtons:true,
				    buttons: "submit,saveAs,showMark,hideMark,importDoc,taohong,safeDoc,deleteSafe,ConvertPDF,ConvertOFD",
				    customButtons: null,
				    waterMark: leapconfig.server + LEAP.getWaterMark(),
				    exparam:{myBookmarks:null,EntityBeans:{configdata:configdata,resultdata:resultdata,tempdata:tempdata}},
					notifyFn:null,
					domain:domain
				};
				
		LEAP.WPSAddon.OpenDocument(param);
	}else{
		var _form = domain.loadForm('loapprint', '周表打印');
	    LEAP.form.maxSize(_form.form);
	    //判断是不是用了iweboffice
	    var afterloadfn = LBCP.DocumentView.afterOpenZWAPTemplete_office;
	    var par = {
	        url: url,
	        afterload: afterloadfn,
	        buttons: "saveAs,print",
	        exparam:{domain:domain,configdata:configdata,resultdata:resultdata,tempdata:tempdata}
	    };
	    LEAP.asyn(_form.module.init, _form.module, 500, par, domain);
	}
	
}

/**
 * 督查督办打印
 * @param {} url
 * @param {} tempdata
 * @param {} resultdata
 * @param {} domain
 */
LBCP.DocumentView.DCDBprintWord = function(url,tempdata,resultdata,domain){
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		if(url.indexof("?")!=-1){
			if(url.indexof("sid=") ==-1){
				url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
			}
		}else{
			url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
		var param = {docType:LEAP.WPSAddon.docType.wps,
					docId: UUID.randomUUID(),
				    fileTitle: tempdata.exporttitle,
				    fileName: url,
				    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
				    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
				    customAfterOpenFn: "LBCP.DocumentView.__afterOpenDcdbprintTemplete_office", 
				    hideDefaultButtons:true,
				    //buttons: "submit,saveAs,showMark,hideMark,importDoc,taohong,safeDoc,deleteSafe,ConvertPDF,ConvertOFD",
				    customButtons: null,
				    waterMark: leapconfig.server + LEAP.getWaterMark(),
				    exparam:{myBookmarks:null,EntityBeans:{resultdata:resultdata,tempdata:tempdata}},
					notifyFn:null,
					domain:domain
				};
				
		LEAP.WPSAddon.OpenDocument(param);
	}
};

//LBCP.DocumentView.afterOpenDCDBprint_wps= function(){
//	debugger;
//	var myDocument = wps.WpsApplication().ActiveDocument;
//	var myDocApp = myDocument.Application;
//	
//	myDocument.TrackRevisions = false;
//	//获取OA端打开模板文件时传入的参数
//	var myParam = process.GetActiveDocParamsValue("exparam");
//
//	//插入文本
//	if (myParam.EntityBeans)
//	{
//		myParam.EntityBeans.iswps = true;
//		LBCP.DocumentView.__afterOpenDcdbprintTemplete_office(null, true, myDocument, myDocApp,myParam.EntityBeans);
//	}	
//	
//};

/**
 *  
 * @param {} template
 * @param {} dispApp
 * @param {} myDocument
 * @param {} activedocument
 * @param {} exparam  插入的数据
 */
LBCP.DocumentView.__afterOpenDcdbprintTemplete_office = function() {
	  
	   	//获取activeDocument
		var myDocument = wps.WpsApplication().ActiveDocument;
		var myDocApp = myDocument.Application;
			//获取OA端打开模板文件时传入的参数
		var exparam = process.GetActiveDocParamsValue("exparam");
		 	
		var range;
		//文件标题
		if (myDocument.Bookmarks.Exists("title")){		  		
			myDocument.Bookmarks.Item("title").Range.InsertBefore(tempdata.exporttitle);
		}
		//myDocApp.Selection.InsertAfter(tempdata.exporttitle);
		var results =[];
		var fields =[];
		var values;
		var data = null;
		var title =null;
		if(exparam&&exparam.EntityBeans&&exparam.EntityBeans.resultdata.childData&&exparam.EntityBeans.resultdata.data&&exparam.EntityBeans.tempdata.exporttitle){
			results = exparam.EntityBeans.resultdata.childData //子任务数据
			data = exparam.EntityBeans.resultdata.data //主表单数据
			fields = exparam.EntityBeans.resultdata.fields // 子任务列表字段
			title = exparam.EntityBeans.tempdata.exporttitle;
		}
		var table = myDocument.Tables.Item(1);
		table.Cell(1,1).Range.InsertAfter(title)
		    for (var key in data) {
            if (myDocument.Bookmarks.Exists(key)) {
            	if("dbjb"==key){
            		if("1"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("平件");
            		}
            		if("2"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("加急");
            		}
            		if("3"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("特急");
            		}
            		if("4"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("特提");
            		}
            	}else if ("dclx"==key){
            	if("1"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("征求意见");
            		}
            	if("2"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("转落实");
            		}
            	if("3"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("转阅办");
            		}
            	if("4"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("反馈意见");
            		}
            	if("5"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("其他");
            		}
            	}else if ("dssblx"==key){
            	if("0"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("不需要反馈");
            		}
            	if("1"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("限时反馈");
            		}
            	}else if ("fkzs"==key){
            	if("1"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("200");
            		}
            	if("2"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("300");
            		}
            	if("3"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("500");
            		}
            	}else if ("sfsfgqld"==key){
            	if("1"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("是");
            		}
            	if("2"==data[key]){
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore("否");
            		}
            	}
            	else{
            		 myDocument.Bookmarks.Item(key).Range.InsertBefore(data[key]);
            	}
            }
        }
		var a=0;;
		for(var j =0;j<fields.length;j++){
		if(fields[j].md){
			a=a+1;
		}
		}
		table.Cell(13, 1).Split(1,a);
		table.Cell(14, 1).Split(1,a);
		for(var i=0;i<fields.length;i++){
			if(fields[i].md){
			table.Cell(13,i+1).Range.InsertAfter(fields[i].showname);
			if(fields[i].md in results[0]){
			var key = fields[i].md
			table.Cell(14,i+1).Range.InsertAfter(results[0][key])}
			}
		}
		//myDocApp.Selection.InsertRowsBelow(13);

}



/**
 * 督查督办导出
 * @param {} url
 * @param {} tempdata
 * @param {} configdata
 * @param {} resultdata
 * @param {} domain
 */
LBCP.DocumentView.DCDBExportWord = function(url,tempdata,resultdata,domain){
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		if(url.indexof("?")!=-1){
			if(url.indexof("sid=") ==-1){
				url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
			}
		}else{
			url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
		var param = {docType:LEAP.WPSAddon.docType.wps,
					docId: UUID.randomUUID(),
				    fileTitle: tempdata.exporttitle,
				    fileName: url,
				    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
				    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
				    customAfterOpenFn: "LBCP.DocumentView.afterOpenDCDB_wps", 
				    hideDefaultButtons:true,
				    //buttons: "submit,saveAs,showMark,hideMark,importDoc,taohong,safeDoc,deleteSafe,ConvertPDF,ConvertOFD",
				    customButtons: null,
				    waterMark: leapconfig.server + LEAP.getWaterMark(),
				    exparam:{myBookmarks:null,EntityBeans:{resultdata:resultdata,tempdata:tempdata}},
					notifyFn:null,
					domain:domain
				};
				
		LEAP.WPSAddon.OpenDocument(param);
	}
}

LBCP.DocumentView.afterOpenDCDB_wps= function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	myDocument.TrackRevisions = false;
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");

	//插入文本
	if (myParam.EntityBeans)
	{
		myParam.EntityBeans.iswps = true;
		LBCP.DocumentView.__afterOpenDcdbTemplete_office(null, true, myDocument, myDocApp,myParam.EntityBeans);
	}	
	
}
//

LBCP.DocumentView.__afterOpenDcdbTemplete_office = function(template, dispApp, myDocument, activedocument,exparam) {
		var myDocApp = null;
		if (myDocument == null)
		{				
			myDocApp =new ActiveXObject("word.Application"); //mydocapp就是这个
			if (dispApp == true)
				myDocApp.Application.Visible = true;
			myDocument = myDocApp.Documents.Open(template);  	
		}
		else
		{
			myDocApp = myDocument.Application;	
		}  	
		var range;
		//文件标题
		if (myDocument.Bookmarks.Exists("title")){		  		
			myDocument.Bookmarks.Item("title").Range.InsertBefore("督查督办任务汇总表");
		}
		var results =[];
		var values;

		if(exparam&&exparam.resultdata&&exparam.tempdata.value){
		var values = exparam.tempdata.value;//列数
        var key	= exparam.tempdata.key;
		
		}
		if(exparam&&exparam.resultdata&&exparam.resultdata.result){
		 results = exparam.resultdata.result //行数
		}
		
		
		var valuesArr =[];
		var keyArr =[];
		if(values&&key){
		 	 valuesArr =values.split(",");
		 	 keyArr = key.split(",");
		}else{
			return;
		}
		var table = myDocument.Tables.Item(1);
		table.Cell(2, 1).Split(1,valuesArr.length);//将第二行进行分割 ，表头插进去
		for(var i=0;i<valuesArr.length;i++){
			table.Cell(2,i+1).Range.InsertAfter(valuesArr[i])
		}
		

		table.Rows.Item(2).Select();
//		myDocApp.Selection.InsertRowsBelow (results.length);	
		
		myDocApp.Selection.InsertRowsBelow(results.length);
		
		for(var j =0;j<results.length;j++){
//		table.Cell(2,i+1).Range.InsertAfter(valuesArr[i])
		for(var n =0;n<keyArr.length;n++){
		var arrs = results[j];
		var  keystr =  keyArr[n];
		table.Cell(3+j,n+1).Range.InsertAfter(arrs[keystr])
		}
	}
					
		var p = 2;
//		table.Rows(p).Select();
		var b = 0;
		var double = [];
		var triple = [];
	
		
		var width = table.Cell(2, 1).Width;
		var rWidth = width/b;
		table.Cell(2, 1).Split(1,this.dcxxs.split(",").length);
		//设置第一行宽度
		for ( var m = 0; m < this.dcxxs.split(",").length; m++) {
			//设置宽度
			if(triple.indexOf(m) != -1){
				table.Cell(2,m+1).Range.cells.Width = rWidth*3;
			}else if(double.indexOf(m) != -1){
				table.Cell(2,m+1).Range.cells.Width = rWidth*2;
			}else{
				table.Cell(2,m+1).Range.cells.Width = rWidth;
			}
		}
		myDocApp.Selection.InsertRowsBelow (this.result.result.length-1);	
		
		var table = myDocument.Tables(1);
		//合并单元格
		for ( var k = 0; k < this.result.result.length; k++) {
			for ( var m = 0; m < this.dcxxs.split(",").length; m++) {
				if (k==0) {//第一行加粗
					table.Cell(k+p,m+1).Range.Font.Bold=1;
				}
				var res = this.result.result;
				//相同任务相同内容合并单元格
				if(k > 0 && res[k][m] && res[k][m] == res[k-1][m] && res[k][0] == res[k-1][0]){
					table.cell(k+p,m+1).Select();
					myDocApp.Selection.MoveUp(Unit=5, Count=1, Extend=1);
					myDocApp.Selection.Cells.Merge();
				}
			}
		}
		//插入内容
		for ( var k = 0; k < this.result.result.length; k++) {
			for ( var m = 0; m < this.dcxxs.split(",").length; m++) {
				var res = this.result.result;
				if(!(k > 0 && res[k][m] && res[k][m] == res[k-1][m] && res[k][0] == res[k-1][0])){
					table.Cell(k+p,m+1).Range.InsertAfter(res[k][m]==null?"":res[k][m]);
				}
			}
		}


}

LBCP.DocumentView.ZWAPExportWord_Leader = function(url,tempdata,daytimes,resultdata,domain){
	//url = leapconfig.server   + url;
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		if(url.indexof("?")!=-1){
			if(url.indexof("sid=") ==-1){
				url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
			}
		}else{
			url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
		var param = {docType:LEAP.WPSAddon.docType.wps,
					docId: UUID.randomUUID(),
				    fileTitle: tempdata.exporttitle,
				    fileName: url,
				    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
				    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
				    customAfterOpenFn: "LBCP.DocumentView.afterOpenZWAPTemplete_wpsAddon_leader", 
				    //hideDefaultButtons:true,
				    buttons: "submit,saveAs,showMark,hideMark,importDoc,taohong,safeDoc,deleteSafe,ConvertPDF,ConvertOFD",
				    customButtons: null,
				    waterMark: leapconfig.server + LEAP.getWaterMark(),
				    exparam:{myBookmarks:null,EntityBeans:{daytimes:daytimes,resultdata:resultdata,tempdata:tempdata}},
					notifyFn:null,
					domain:domain
				};
				
		LEAP.WPSAddon.OpenDocument(param);
	}else{
		var _form = domain.loadForm('loapprint', '周表打印');
	    LEAP.form.maxSize(_form.form);
	    //判断是不是用了iweboffice
	    var afterloadfn = LBCP.DocumentView.afterOpenZWAPTemplete_office_leader;
	    var par = {
	        url: url,
	        afterload: afterloadfn,
	        buttons: "saveAs,print",
	        exparam:{domain:domain,resultdata:resultdata,tempdata:tempdata,daytimes:daytimes}
	    };
	    LEAP.asyn(_form.module.init, _form.module, 500, par, domain);
	}
	
}

LBCP.DocumentView.ZWAPExportWord_Person = function(url,tempdata,leadername,configdata,resultdata,domain){
	//url = leapconfig.server   + url;
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		if(url.indexof("?")!=-1){
			if(url.indexof("sid=") ==-1){
				url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
			}
		}else{
			url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
		var param = {docType:LEAP.WPSAddon.docType.wps,
					docId: UUID.randomUUID(),
				    fileTitle: tempdata.exporttitle,
				    fileName: url,
				    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
				    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
				    customAfterOpenFn: "LBCP.DocumentView.afterOpenZWAPTemplete_wpsAddon_person", 
				    //hideDefaultButtons:true,
				    buttons: "submit,saveAs,showMark,hideMark,importDoc,taohong,safeDoc,deleteSafe,ConvertPDF,ConvertOFD",
				    customButtons: null,
				    waterMark: leapconfig.server + LEAP.getWaterMark(),
				    exparam:{myBookmarks:null,EntityBeans:{configdata:configdata,resultdata:resultdata,tempdata:tempdata,leadername:leadername}},
					notifyFn:null,
					domain:domain
				};
				
		LEAP.WPSAddon.OpenDocument(param);
	}else{
		var _form = domain.loadForm('loapprint', '周表打印');
	    LEAP.form.maxSize(_form.form);
	    //判断是不是用了iweboffice
	    var afterloadfn = LBCP.DocumentView.afterOpenZWAPTemplete_office_person;
	    var par = {
	        url: url,
	        afterload: afterloadfn,
	        buttons: "saveAs,print",
	        exparam:{domain:domain,configdata:configdata,resultdata:resultdata,tempdata:tempdata,leadername:leadername}
	    };
	    LEAP.asyn(_form.module.init, _form.module, 500, par, domain);
	}
	
}

LBCP.DocumentView.ZWAPExportWord_NewFormat = function(url,tempdata,daytimes,resultdata,domain){
	//url = leapconfig.server   + url;
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		if(url.indexof("?")!=-1){
			if(url.indexof("sid=") ==-1){
				url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
			}
		}else{
			url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
		var param = {docType:LEAP.WPSAddon.docType.wps,
					docId: UUID.randomUUID(),
				    fileTitle: tempdata.exporttitle,
				    fileName: url,
				    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
				    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
				    customAfterOpenFn: "LBCP.DocumentView.afterOpenZWAPTemplete_wpsAddon_newformat", 
				    //hideDefaultButtons:true,
				    buttons: "submit,saveAs,showMark,hideMark,importDoc,taohong,safeDoc,deleteSafe,ConvertPDF,ConvertOFD",
				    customButtons: null,
				    waterMark: leapconfig.server + LEAP.getWaterMark(),
				    exparam:{myBookmarks:null,EntityBeans:{daytimes:daytimes,resultdata:resultdata,tempdata:tempdata}},
					notifyFn:null,
					domain:domain
				};
				
		LEAP.WPSAddon.OpenDocument(param);
	}else{
		var _form = domain.loadForm('loapprint', '周表打印');
	    LEAP.form.maxSize(_form.form);
	    //判断是不是用了iweboffice
	    var afterloadfn = LBCP.DocumentView.afterOpenZWAPTemplete_office_newformat;
	    var par = {
	        url: url,
	        afterload: afterloadfn,
	        buttons: "saveAs,print",
	        exparam:{domain:domain,resultdata:resultdata,tempdata:tempdata,daytimes:daytimes}
	    };
	    LEAP.asyn(_form.module.init, _form.module, 500, par, domain);
	}
	
}

LBCP.DocumentView.afterOpenZWAPTemplete_office = function(myDocument, activedocument,exparam) {
    return LBCP.DocumentView.__afterOpenZWAPTemplete_office(null, true, myDocument, activedocument,exparam);
}

LBCP.DocumentView.afterOpenZWAPTemplete_office_leader = function(myDocument, activedocument,exparam) {
    return LBCP.DocumentView.__afterOpenZWAPTemplete_office_leader(null, true, myDocument, activedocument,exparam);
}

LBCP.DocumentView.afterOpenZWAPTemplete_office_person = function(myDocument, activedocument,exparam) {
    return LBCP.DocumentView.__afterOpenZWAPTemplete_office_person(null, true, myDocument, activedocument,exparam);
}

LBCP.DocumentView.afterOpenZWAPTemplete_office_newformat = function(myDocument, activedocument,exparam) {
    return LBCP.DocumentView.__afterOpenZWAPTemplete_office_newformat(null, true, myDocument, activedocument,exparam);
}

LBCP.DocumentView.__afterOpenZWAPTemplete_office = function(template, dispApp, myDocument, activedocument,exparam) {
		try {
			var myDocApp = null;
			if(exparam.iswps){
				myDocApp = activedocument;
			}else{
				if (myDocument == null) {
					myDocApp = new ActiveXObject("word.Application"); // mydocapp就是这个
					if (dispApp == true)
						myDocApp.Application.Visible = true;
					myDocument = myDocApp.Documents.Open(template);
				} else {
					myDocApp = myDocument.application;
				}
			}
			var jsondata = "";
			var pathurl  = "";
			var title  = "";
			var headers;
			var p = 2;
			if(exparam.configdata){
				if(exparam.configdata.exportconfig){
					jsondata = JSON.parse(exparam.configdata.exportconfig);
					p = parseInt(jsondata.wordstartnum);
					headers =jsondata.exportconfig;
				}else{
					jsondata = exparam.configdata;
					p = parseInt(jsondata.wordstartnum);
					headers =jsondata.exportfiled;
				}
			}
			var range;
			// 文件标题
			var table;
			var result = exparam.resultdata.result;
			var starttime = exparam.tempdata.weekstart;
			var endtime = exparam.tempdata.weekend;
			if(exparam.iswps || LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
				if (myDocument.Bookmarks.Exists("title")){
					myDocument.Bookmarks.Item("title").Range.InsertBefore(exparam.tempdata.exporttitle);
				}
				if (myDocument.Bookmarks.Exists("smalltitle")){
					myDocument.Bookmarks.Item("smalltitle").Range.InsertBefore(starttime.split("-")[0] + "年" +starttime.split("-")[1] + "月"	+ starttime.split("-")[2] + "日" + "---"	+(endtime.split("-")[0]==starttime.split("-")[0]?"":(endtime.split("-")[0]+"年"))+ endtime.split("-")[1] + "月" + endtime.split("-")[2] + "日");
				}
				table = myDocument.Tables.Item(1);
				table.Rows.Item(p).Select();
			}else{
				if (myDocument.BookMarks.Exists("title")){
					myDocument.Bookmarks("title").Range.InsertBefore(exparam.tempdata.exporttitle);
				}
				if (myDocument.BookMarks.Exists("smalltitle")){
					myDocument.Bookmarks("smalltitle").Range.InsertBefore(starttime.split("-")[0] + "年" +starttime.split("-")[1] + "月"	+ starttime.split("-")[2] + "日" + "---"	+(endtime.split("-")[0]==starttime.split("-")[0]?"":(endtime.split("-")[0]+"年"))+ endtime.split("-")[1] + "月" + endtime.split("-")[2] + "日");
				}
				table = myDocument.Tables(1);
				table.Rows(p).Select();
			}
			// 主要 一周
			var rowcount = result[0].daynum;
			// 插入的行数
			if ((rowcount - 1) != 0) {
				myDocApp.Selection.InsertRowsBelow(rowcount - 1);
			}

			var weeklength = 0;
			var week = [];
			var bean = {};
			for(var r = 0;r<result.length;r++){
				if(result[r].pmnum!=""){
					var sw = 0;
					var xw = 0;
					var ws = 0;
					if(result[r]!=null && result[r].datanum!="" && result[r].activitypm=="1"){
						sw = result[r].datanum;
						bean.swdata = sw;
					}
					if(result[r+sw]!=null && result[r+sw].datanum!="" && result[r+sw].activitypm=="2"){
						xw = result[r+sw].datanum;
						bean.xwdata = xw;
					}
					if(result[r+sw+xw]!=null && result[r+sw+xw].datanum!="" && result[r+sw+xw].activitypm=="3"){
						ws = result[r+sw+xw].datanum;
						bean.wsdata = ws;
					}
					week[weeklength] = bean;
					weeklength++;
					bean = {};
				}
			}
			// 临时行数
			// 一周表
			var daynum = 0;
			var rqcfflag = false;
			var swxwflag = false;
			var zbldflag = false;
			if(headers["dateday"]){
				rqcfflag = headers["dateday"].ismergecell;
			}
			if(headers["swxw"]){
				swxwflag = headers["swxw"].ismergecell;
			}
			if(headers["dutyleader"]){
				zbldflag = headers["dutyleader"].ismergecell;
			}
			for(var t = 0;t<rowcount;t++){
				if(headers["dateday"]){
			 	 	var ftype = headers["dateday"].ftype;
					var cellnum = headers["dateday"].cellnum;
				 		var datime = LBCP.DocumentView.getWeek(result[daynum].startdate)+"\n";
				 		if(ftype && ftype.indexOf("月")!=-1 && ftype.indexOf("日")!=-1 ){
				 			datime =  LBCP.DocumentView.setFormat(result[daynum].startdate);
				 			if(ftype.indexOf("星期")!=-1){
				 				datime += "\n" + LBCP.DocumentView.getWeek(result[daynum].startdate,1);
				 			}
				 		}
							// 拆分前插入必要数据
				 		if(week[t].swdata>22||week[t].xwdata>22||week[t].wsdata>22){
		   					table.Cell(p + daynum, cellnum).Range.InsertAfter("\r\n" +"\r\n" +"\r\n" +"\r\n" + datime + "\r\n"+ "\r\n"+ "\r\n"+ "\r\n");
		   				}else{
		   					if(week[t].swdata>18||week[t].xwdata>18||week[t].wsdata>18){
		   						table.Cell(p + daynum, cellnum).Range.InsertAfter("\r\n" +"\r\n" +"\r\n" + datime + "\r\n"+ "\r\n"+ "\r\n");
		   					}else{
		   						if(week[t].swdata>12||week[t].xwdata>12||week[t].wsdata>12){
				   					table.Cell(p + daynum, cellnum).Range.InsertAfter("\r\n" +"\r\n" + datime + "\r\n"+ "\r\n");
				   				}else{
				   					if((week[t].swdata+week[t].xwdata+week[t].wsdata)==1){
				   						table.Cell(p + daynum, cellnum).Range.InsertAfter(datime);	
				   					}else{
				   						table.Cell(p + daynum, cellnum).Range.InsertAfter("\r\n" +datime+ "\r\n");
				   					}
				   				}		   						
		   					}
		   				}
				 }
				if(headers["dutyleader"]){
					var ftype = headers["dutyleader"].ftype;
					var cellnum = headers["dutyleader"].cellnum;
					var ismergecell = headers["dutyleader"].ismergecell;
					var leaders = result[daynum].dutyleader?result[daynum].dutyleader:"";
					if(ftype){
						var flag = "";
						flag = ftype.charAt("2");
						if(leaders&&flag){
							leaders = leaders.replace(/\//g,",").replace(/、/g,",").replace(/,/,flag);
						}
					}
					if(week[t].swdata>22||week[t].xwdata>22||week[t].wsdata>22){
			   			table.Cell(p + daynum, cellnum).Range.InsertAfter("\r\n" +"\r\n" +"\r\n" +"\r\n" + leaders + "\r\n"+ "\r\n"+ "\r\n"+ "\r\n");
			   		}else{
			   			if(week[t].swdata>18||week[t].xwdata>18||week[t].wsdata>18){
			   				table.Cell(p + daynum, cellnum).Range.InsertAfter("\r\n" +"\r\n" +"\r\n" + leaders + "\r\n"+ "\r\n"+ "\r\n");
			   			}else{
			   				if(week[t].swdata>12||week[t].xwdata>12||week[t].wsdata>12){
					   			table.Cell(p + daynum, cellnum).Range.InsertAfter("\r\n" +"\r\n" + leaders + "\r\n"+ "\r\n");
					   		}else{
					   			if((week[t].swdata+week[t].xwdata+week[t].wsdata)==1){
					   				table.Cell(p + daynum, cellnum).Range.InsertAfter(leaders);	
					   			}else{
					   				table.Cell(p + daynum, cellnum).Range.InsertAfter("\r\n" +leaders+ "\r\n");
					   			}
					   		}		   						
			   			}
			   		}
				}
//				table.Cell(p + daynum, 1).Range.InsertAfter(this.setFormat(result[daynum].startdate) + "\n" + this.getWeek(result[daynum].startdate));
				
				if ( result[daynum].pmnum!="") {
					
					var pmnum = parseInt(result[daynum].pmnum);
					if(pmnum>1){
						//拆分时段单元格
						if(headers["dateday"]&&!rqcfflag){
							LBCP.DocumentView.Tablesplitfunc(table,headers,"dateday",p + daynum,pmnum);
							var cellnum = headers["dateday"].cellnum;
							if(exparam.iswps || LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
								table.Cell(p + daynum, cellnum).Range.Cut();
							}else{
								table.Cell(p + daynum, cellnum).Range.cut();
							}
						}
						if(headers["swxw"]){
							LBCP.DocumentView.Tablesplitfunc(table,headers,"swxw",p + daynum,pmnum);
						}
						if(headers["datetime"]){
					 		LBCP.DocumentView.Tablesplitfunc(table,headers,"datetime",p + daynum,pmnum);
						}
						if(headers["activityname"]){
					 		LBCP.DocumentView.Tablesplitfunc(table,headers,"activityname",p + daynum,pmnum);
						}
						if(headers["address"]){
					 		LBCP.DocumentView.Tablesplitfunc(table,headers,"address",p + daynum,pmnum);
						}
						if(headers["printleader"]){
					 		LBCP.DocumentView.Tablesplitfunc(table,headers,"printleader",p + daynum,pmnum);
						}
						if(headers["unitleader"]){
					 		LBCP.DocumentView.Tablesplitfunc(table,headers,"unitleader",p + daynum,pmnum);
						}
						if(headers["maindept"]){
					 		LBCP.DocumentView.Tablesplitfunc(table,headers,"maindept",p + daynum,pmnum);
						}
						if(headers["remarks"]){
					 		LBCP.DocumentView.Tablesplitfunc(table,headers,"remarks",p + daynum,pmnum);
						}
						if(headers["dutyleader"]&&!zbldflag){
					 	 	LBCP.DocumentView.Tablesplitfunc(table,headers,"dutyleader",p + daynum,pmnum);
					 	 	var cellnum = headers["dutyleader"].cellnum;
					 	 	if(exparam.iswps || LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
								table.Cell(p + daynum, cellnum).Range.Cut();
							}else{
								table.Cell(p + daynum, cellnum).Range.cut();
							}
						}
					}
					//上午下午晚上
					for(var m = 0;m<pmnum;m++){
						//插入时段
						if(headers["swxw"]&&swxwflag){
					 	 	var ftype = headers["swxw"].ftype;
							var cellnum = headers["swxw"].cellnum;
						 	var ismergecell = headers["swxw"].ismergecell;
						 	table.Cell(p + daynum, cellnum).Range.InsertAfter(result[daynum].activitypm=="1"?"上午":(result[daynum].activitypm=="2"?"下午":(result[daynum].activitypm=="3"?"晚上":"全天")));
						 }
						
						if(result[daynum].datanum!=""){
							var datanum = parseInt(result[daynum].datanum);
							if(datanum>1){
								//拆分后面数据单元格
								if(headers["dateday"]&&!rqcfflag){
									LBCP.DocumentView.Tablesplitfunc(table,headers,"dateday",p + daynum,datanum);
									var cellnum = headers["dateday"].cellnum;
									if(exparam.iswps || LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
										table.Cell(p + daynum, cellnum).Range.Cut();
									}else{
										table.Cell(p + daynum, cellnum).Range.cut();
									}
								}
								if(headers["swxw"]&&!swxwflag){
									LBCP.DocumentView.Tablesplitfunc(table,headers,"swxw",p + daynum,datanum);
									var cellnum = headers["swxw"].cellnum;
									if(exparam.iswps || LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
										table.Cell(p + daynum, cellnum).Range.Cut();
									}else{
										table.Cell(p + daynum, cellnum).Range.cut();
									}
								}
								if(headers["datetime"]){
									LBCP.DocumentView.Tablesplitfunc(table,headers,"datetime",p + daynum,datanum);
								}
								if(headers["activityname"]){
							 		LBCP.DocumentView.Tablesplitfunc(table,headers,"activityname",p + daynum,datanum);
								}
								if(headers["address"]){
							 		LBCP.DocumentView.Tablesplitfunc(table,headers,"address",p + daynum,datanum);
								}
								if(headers["printleader"]){
							 	 	LBCP.DocumentView.Tablesplitfunc(table,headers,"printleader",p + daynum,datanum);
								}
								if(headers["unitleader"]){
								 	LBCP.DocumentView.Tablesplitfunc(table,headers,"unitleader",p + daynum,datanum);
								}
								if(headers["maindept"]){
							 	 	LBCP.DocumentView.Tablesplitfunc(table,headers,"maindept",p + daynum,datanum);
								}
								if(headers["remarks"]){
							 	 	LBCP.DocumentView.Tablesplitfunc(table,headers,"remarks",p + daynum,datanum);
								}
								if(headers["dutyleader"]&&!zbldflag){
							 	 	LBCP.DocumentView.Tablesplitfunc(table,headers,"dutyleader",p + daynum,datanum);
							 	 	var cellnum = headers["dutyleader"].cellnum;
									if(exparam.iswps || LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
										table.Cell(p + daynum, cellnum).Range.Cut();
									}else{
										table.Cell(p + daynum, cellnum).Range.cut();
									}
								}
							}
							//每个时段的每条数据
							for (var j = 0; j < datanum; j++) {
								if(headers["dateday"]&&!rqcfflag){
									var ftype = headers["dateday"].ftype;
									var cellnum = headers["dateday"].cellnum;
								 	var ismergecell = headers["dateday"].ismergecell;
								 	var datime = LBCP.DocumentView.getWeek(result[daynum].startdate)+"\n";
								 	if(ftype && ftype.indexOf("月")!=-1 && ftype.indexOf("日")!=-1 ){
								 		datime =  LBCP.DocumentView.setFormat(result[daynum].startdate);
								 		if(ftype.indexOf("星期")!=-1){
								 			datime += "\n" + LBCP.DocumentView.getWeek(result[daynum].startdate,1);
								 		}
								 	}
								 	table.Cell(p + daynum, cellnum).Range.InsertAfter(datime);
								}
								if(headers["swxw"]&&!swxwflag){
									var ftype = headers["swxw"].ftype;
									var cellnum = headers["swxw"].cellnum;
								 	var ismergecell = headers["swxw"].ismergecell;
								 	table.Cell(p + daynum, cellnum).Range.InsertAfter(result[daynum].activitypm=="1"?"上午":(result[daynum].activitypm=="2"?"下午":(result[daynum].activitypm=="3"?"晚上":"全天")));
								}
								if(headers["datetime"]){
									var swxw = result[daynum].activitypm=="1"?"上午":(result[daynum].activitypm=="2"?"下午":(result[daynum].activitypm=="3"?"晚上":"全天"));
									if(swxw=="全天"){
										table.Cell(p + daynum, cellnum).Range.InsertAfter("");
									}else{
										var ftype = headers["datetime"].ftype;
										var cellnum = headers["datetime"].cellnum;
									 	var ismergecell = headers["datetime"].ismergecell;
									 	var time = "";
									 	var hour = result[daynum].hourselect;
									 	var minite = result[daynum].miniteselect;
									 	if(!ftype||ftype=="24h"){
									 		if(hour <10){
								 				hour = "0"+hour;
								 			}
								 			if(minite <10){
								 				minite = "0"+minite;
								 			}
									 		time = hour +":"+ minite;
									 		table.Cell(p + daynum, cellnum).Range.InsertAfter(time);
									 	}else{
									 		if(hour >12){
									 			hour -= 12;
									 		}
								 			if(minite <10){
								 				minite = "0"+minite;
								 			}
									 		time = (hour<10?"0"+hour:hour) +":"+ minite;
									 		if(ftype && ftype.indexOf("--")!=-1){
										 		if(result[daynum].enddate){
										 			var eh = parseInt(result[daynum].enddate.substring(11,13));
										 			var eswxw = "";
													if(eh<=12){
														eswxw = "上午";
													}else{
														if(hour==12&&swxw=="上午"){
															swxw = "中午";
														}
														if(eh<18){
															eswxw = "下午";
														}else{
															if(eh==18&&swxw!="晚上"){
																eswxw = "下午";
															}else{
																eswxw = "晚上";
															}
														}
														eh-=12;
													}
													if(swxw==eswxw){
														eswxw="";
													}
										 			var edate = " -- " + eswxw+(eh<10?"0"+eh:eh)+result[daynum].enddate.substring(13,16) +"时";
										 			table.Cell(p + daynum, cellnum).Range.InsertAfter( swxw + time +"时" + edate);
										 		}else{
										 			table.Cell(p + daynum, cellnum).Range.InsertAfter( swxw + time +"时");
										 		}
										 	}else{
										 		table.Cell(p + daynum, cellnum).Range.InsertAfter(time);
										 	}
									 	}
									}
								 }
								 
								 if(headers["activityname"]){
							 	 	var ftype = headers["activityname"].ftype;
									var cellnum = headers["activityname"].cellnum;
								 	var ismergecell = headers["activityname"].ismergecell;
								 	table.Cell(p + daynum, cellnum).Range.InsertAfter(result[daynum].activityname);
								 }
								 if(headers["address"]){
							 	 	var ftype = headers["address"].ftype;
									var cellnum = headers["address"].cellnum;
								 	var ismergecell = headers["address"].ismergecell;
								 	table.Cell(p + daynum, cellnum).Range.InsertAfter(result[daynum].address);
								 }
								 if(headers["printleader"]){
							 	 	var ftype = headers["printleader"].ftype;
									var cellnum = headers["printleader"].cellnum;
								 	var ismergecell = headers["printleader"].ismergecell;
								 	var leaders = "";
									if(result[daynum].printleader){
										leaders = result[daynum].printleader;
									}
									if(result[daynum].antherleader){
										if(leaders !=""){
											leaders += "," +result[daynum].antherleader;
										}else{
											leaders = result[daynum].antherleader;
										}
									}
								 	table.Cell(p + daynum, cellnum).Range.InsertAfter(leaders);
								 }
								 if(headers["unitleader"]){
									var ftype = headers["unitleader"].ftype;
									var cellnum = headers["unitleader"].cellnum;
									var ismergecell = headers["unitleader"].ismergecell;
									var leaders = "";
									if(result[daynum].unitleader){
										leaders = result[daynum].unitleader;
									}
									if(result[daynum].antherleader){
										if(leaders !=""){
											leaders += "," +result[daynum].antherleader;
										}else{
											leaders = result[daynum].antherleader;
										}
									}
								 	table.Cell(p + daynum, cellnum).Range.InsertAfter(leaders);
								 }
								 if(headers["maindept"]){
							 	 	var ftype = headers["maindept"].ftype;
									var cellnum = headers["maindept"].cellnum;
								 	var ismergecell = headers["maindept"].ismergecell;
								 	table.Cell(p + daynum, cellnum).Range.InsertAfter(result[daynum].maindept);
								
								 }
								
								 if(headers["remarks"]){
							 	 	var ftype = headers["remarks"].ftype;
									var cellnum = headers["remarks"].cellnum;
								 	var ismergecell = headers["remarks"].ismergecell;
								 	table.Cell(p + daynum, cellnum).Range.InsertAfter(result[daynum].remarks);
								
								 }
								 if(headers["dutyleader"]&&!zbldflag){
							 	 	var ftype = headers["dutyleader"].ftype;
									var cellnum = headers["dutyleader"].cellnum;
								 	var ismergecell = headers["dutyleader"].ismergecell;
								 	var leaders = result[daynum].dutyleader;
	   								if(ftype){
										var flag = "";
										flag = ftype.charAt("2");
										if(leaders&&flag){
											leaders = leaders.replace(/\//g,",").replace(/、/g,",").replace(/,/,flag);
										}
									}
	   								table.Cell(p + daynum, cellnum).Range.InsertAfter(leaders);
								 }
								
								daynum++;
							}
						}
					}
				}
			}
		} catch (e) {
			alert(e.description);
		} finally {
			myDocApp = myDocument = range = opinions = arr = table = i = op = row = k = sq = pagesCount = idx = rg = row = sqIdx = bonds = _idx = daynum = null;
		}
	
}

LBCP.DocumentView.__afterOpenZWAPTemplete_office_leader = function(template, dispApp, myDocument, activedocument,exparam) {
		try {
			var myDocApp = null;
			if(exparam.iswps){
				myDocApp = activedocument;
			}else{
				if (myDocument == null) {
					myDocApp = new ActiveXObject("word.Application"); // mydocapp就是这个
					if (dispApp == true)
						myDocApp.Application.Visible = true;
					myDocument = myDocApp.Documents.Open(template);
				} else {
					myDocApp = myDocument.application;
				}
			}
			var pathurl  = "";
			var title  = "";
			var p = 2;
			var range;
			// 文件标题
			var table;
			var result = exparam.resultdata.result;
			var starttime = exparam.tempdata.weekstart;
			var endtime = exparam.tempdata.weekend;
			var isNewType = false;
			if(exparam.tempdata.isNewType == true){
				isNewType = true;
			}
			var weekEname = ["monday", "tuesday", "wednesday", "thursday", "friday","saturday", "sunday"];
			var weekname = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"];
			var daytimes = exparam.daytimes;
			if(exparam.iswps || LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
				if (myDocument.Bookmarks.Exists("title")){
					myDocument.Bookmarks.Item("title").Range.InsertBefore(exparam.tempdata.exporttitle);
				}
				if (myDocument.Bookmarks.Exists("smalltitle")){
					myDocument.Bookmarks.Item("smalltitle").Range.InsertBefore(starttime.split("-")[0] + "年" +starttime.split("-")[1] + "月"	+ starttime.split("-")[2] + "日" + "---"	+(endtime.split("-")[0]==starttime.split("-")[0]?"":(endtime.split("-")[0]+"年"))+ endtime.split("-")[1] + "月" + endtime.split("-")[2] + "日");
				}
				//插入星期
				if (myDocument.Bookmarks.Exists("week1")){
					myDocument.Bookmarks.Item("week1").Range.InsertBefore(weekname[0]);
				}
				if (myDocument.Bookmarks.Exists("week2")){
					myDocument.Bookmarks.Item("week2").Range.InsertBefore(weekname[1]);
				}
				if (myDocument.Bookmarks.Exists("week3")){
					myDocument.Bookmarks.Item("week3").Range.InsertBefore(weekname[2]);
				}
				if (myDocument.Bookmarks.Exists("week4")){
					myDocument.Bookmarks.Item("week4").Range.InsertBefore(weekname[3]);
				}
				if (myDocument.Bookmarks.Exists("week5")){
					myDocument.Bookmarks.Item("week5").Range.InsertBefore(weekname[4]);
				}
				//插入日期
				if (myDocument.Bookmarks.Exists("day1")){
					myDocument.Bookmarks.Item("day1").Range.InsertBefore(daytimes[0]);
				}
				if (myDocument.Bookmarks.Exists("day2")){
					myDocument.Bookmarks.Item("day2").Range.InsertBefore(daytimes[1]);
				}
				if (myDocument.Bookmarks.Exists("day3")){
					myDocument.Bookmarks.Item("day3").Range.InsertBefore(daytimes[2]);
				}
				if (myDocument.Bookmarks.Exists("day4")){
					myDocument.Bookmarks.Item("day4").Range.InsertBefore(daytimes[3]);
				}
				if (myDocument.Bookmarks.Exists("day5")){
					myDocument.Bookmarks.Item("day5").Range.InsertBefore(daytimes[4]);
				}
				table = myDocument.Tables.Item(1);
				table.Rows.Item(p).Select();
			}else{
				if (myDocument.Bookmarks.Exists("title")){
					myDocument.Bookmarks("title").Range.InsertBefore(exparam.tempdata.exporttitle);
				}
				if (myDocument.Bookmarks.Exists("smalltitle")){
					myDocument.Bookmarks("smalltitle").Range.InsertBefore(starttime.split("-")[0] + "年" +starttime.split("-")[1] + "月"	+ starttime.split("-")[2] + "日" + "---"	+(endtime.split("-")[0]==starttime.split("-")[0]?"":(endtime.split("-")[0]+"年"))+ endtime.split("-")[1] + "月" + endtime.split("-")[2] + "日");
				}
				//插入星期
				if (myDocument.Bookmarks.Exists("week1")){
					myDocument.Bookmarks("week1").Range.InsertBefore(weekname[0]);
				}
				if (myDocument.Bookmarks.Exists("week2")){
					myDocument.Bookmarks("week2").Range.InsertBefore(weekname[1]);
				}
				if (myDocument.Bookmarks.Exists("week3")){
					myDocument.Bookmarks("week3").Range.InsertBefore(weekname[2]);
				}
				if (myDocument.Bookmarks.Exists("week4")){
					myDocument.Bookmarks("week4").Range.InsertBefore(weekname[3]);
				}
				if (myDocument.Bookmarks.Exists("week5")){
					myDocument.Bookmarks("week5").Range.InsertBefore(weekname[4]);
				}
				table = myDocument.Tables(1);
				table.Rows(p).Select();
				//插入日期
				if (myDocument.Bookmarks.Exists("day1")){
					myDocument.Bookmarks("day1").Range.InsertBefore(daytimes[0]);
				}
				if (myDocument.Bookmarks.Exists("day2")){
					myDocument.Bookmarks("day2").Range.InsertBefore(daytimes[1]);
				}
				if (myDocument.Bookmarks.Exists("day3")){
					myDocument.Bookmarks("day3").Range.InsertBefore(daytimes[2]);
				}
				if (myDocument.Bookmarks.Exists("day4")){
					myDocument.Bookmarks("day4").Range.InsertBefore(daytimes[3]);
				}
				if (myDocument.Bookmarks.Exists("day5")){
					myDocument.Bookmarks("day5").Range.InsertBefore(daytimes[4]);
				}
			}
			// 主要 一周
			var rowcount = result.length/3;
			// 插入的行数
			if ((rowcount - 1) != 0) {
				myDocApp.Selection.InsertRowsBelow(rowcount - 1);
			}
			var week = [];
			var bean = {};
			var weeknum = 0;
			var pm = "";
			var mText = "";
			var leadername = "";
			if(isNewType){
				var indexs = [];
				for(var r = 0;r<result.length;r++){
					if(result[r].activitypm==3){
						if(result[r].monday){
							if(result[r-1].monday){
								result[r-1].monday = result[r-1].monday.concat(result[r].monday);
							}else{
								result[r-1].monday = result[r].monday;
							}
						}
						if(result[r].tuesday){
							if(result[r-1].tuesday){
								result[r-1].tuesday = result[r-1].tuesday.concat(result[r].tuesday);
							}else{
								result[r-1].tuesday = result[r].tuesday;
							}
						}
						if(result[r].wednesday){
							if(result[r-1].wednesday){
								result[r-1].wednesday = result[r-1].wednesday.concat(result[r].wednesday);
							}else{
								result[r-1].wednesday = result[r].wednesday;
							}
						}
						if(result[r].thursday){
							if(result[r-1].thursday){
								result[r-1].thursday = result[r-1].thursday.concat(result[r].thursday);
							}else{
								result[r-1].thursday = result[r].thursday;
							}
						}
						if(result[r].friday){
							if(result[r-1].friday){
								result[r-1].friday = result[r-1].friday.concat(result[r].friday);
							}else{
								result[r-1].friday = result[r].friday;
							}
						}
						if(result[r].saturday){
							if(result[r-1].saturday){
								result[r-1].saturday = result[r-1].saturday.concat(result[r].saturday);
							}else{
								result[r-1].saturday = result[r].saturday;
							}
						}
						if(result[r].sunday){
							if(result[r-1].sunday){
								result[r-1].sunday = result[r-1].sunday.concat(result[r].sunday);
							}else{
								result[r-1].sunday = result[r].sunday;
							}
						}
						indexs.push(r);
					}
				}
				if(indexs.length>0){
					for(var a=indexs.length-1;a>=0;a--){
						result.splice(indexs[a],1);
					}
				}
			}
			for(var r = 0;r<result.length;r++){
				if(r==0){
					leadername = result[r].name;
					bean.name = leadername;
				}
				if(result[r].name != leadername){
					leadername = result[r].name;
					week[weeknum] = bean;
					weeknum++;
					bean = {};
					bean.name = leadername;
				}
				if(result[r].name == leadername){
					pm = result[r].activitypm=="1"?"上午:":(result[r].activitypm=="2"?"下午:":(result[r].activitypm=="3"?"晚上:":"全天:"));
					if(isNewType){
						pm = result[r].activitypm=="2"?"下午：":"上午：";
					}
					for(var w = 0;w<weekEname.length;w++){
						if(typeof(result[r][weekEname[w]])=="object" && result[r][weekEname[w]].length>0){
							var weekdata = result[r][weekEname[w]];
							if(weekEname[w]=="saturday" || weekEname[w]=="sunday"){
								mText += pm;
							}else{
								mText += pm +(isNewType?"":"  ");
							}
							for(var i=0;i<weekdata.length;i++){
								if(this.exportnum){
									if(weekdata.length==1){
										mText += weekdata[i].activityname+(isNewType?"；":"")+"\r\n";
									}else if(i<20){
										mText += this.sortnum[i]+weekdata[i].activityname+(isNewType?"；":"")+"\r\n";
									}else{
										mText += (i+1+".")+weekdata[i].activityname+(isNewType?"；":"")+"\r\n";
									}
								}else{
									mText += (isNewType?"":(weekdata[i].startdate.substring(11,16)+" "))+weekdata[i].activityname+(isNewType?"；":"")+"\r\n";
								}
							}
						}else{
							if(!result[r][weekEname[w]]||(result[r][weekEname[w]]=="休息"&&(weekEname[w]=="saturday" || weekEname[w]=="sunday"))){
								mText = "";
							}else{
								mText += pm +"  "+result[r][weekEname[w]]+(isNewType?"；":"")+"\r\n";
							}
						}
						bean[weekEname[w]] =(bean[weekEname[w]]!=undefined?bean[weekEname[w]]:"")+mText;
						mText = "";
					}
					if(r==result.length-1){
						week[weeknum] = bean;
					}
				}
			}
			// 一周表
			var range = "";
			for(var t = 0;t<rowcount;t++){
				table.Cell(p + t, 1).Range.InsertAfter(week[t].name);
				table.Cell(p + t, 2).Range.InsertAfter(week[t].monday.trim());				
				table.Cell(p + t, 3).Range.InsertAfter(week[t].tuesday.trim());
				table.Cell(p + t, 4).Range.InsertAfter(week[t].wednesday.trim());
				table.Cell(p + t, 5).Range.InsertAfter(week[t].thursday.trim());
				table.Cell(p + t, 6).Range.InsertAfter(week[t].friday.trim());
				if(week[t].saturday!=""){
					range = daytimes[5]+"\r\n("+weekname[5]+")\r\n"+week[t].saturday+"\r\n";
				}
				if(week[t].sunday!=""){
					range += daytimes[6]+"\r\n("+weekname[6]+")\r\n"+week[t].sunday;
				}
				table.Cell(p + t, 7).Range.InsertAfter(range.trim());
				range = "";
						
			}
		} catch (e) {
			alert(e.description);
		} finally {
			myDocApp = myDocument = range = opinions = arr = table = i = op = row = k = sq = pagesCount = idx = rg = row = sqIdx = bonds = _idx = daynum = null;
		}
	
}

LBCP.DocumentView.__afterOpenZWAPTemplete_office_person = function(template, dispApp, myDocument, activedocument,exparam) {
		try {
			var myDocApp = null;
			if(exparam.iswps){
				myDocApp = activedocument;
			}else{
				if (myDocument == null) {
					myDocApp = new ActiveXObject("word.Application"); // mydocapp就是这个
					if (dispApp == true)
						myDocApp.Application.Visible = true;
					myDocument = myDocApp.Documents.Open(template);
				} else {
					myDocApp = myDocument.application;
				}
			}
			var jsondata = "";
			var pathurl  = "";
			var title  = "";
			var headers;
			var p = 2;
			if(exparam.configdata){
				if(exparam.configdata.exportconfig){
					jsondata = JSON.parse(exparam.configdata.exportconfig);
					p = parseInt(jsondata.wordstartnum);
					headers =jsondata.exportconfig;
				}else{
					jsondata = exparam.configdata;
					p = parseInt(jsondata.wordstartnum);
					headers =jsondata.exportfiled;
				}
			}
			var range;
			// 文件标题
			var table;
			var result = exparam.resultdata.result;
			var starttime = exparam.tempdata.weekstart;
			var endtime = exparam.tempdata.weekend;
			var leadername = exparam.leadername;
			if(exparam.iswps || LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
				if (myDocument.Bookmarks.Exists("title")){
					myDocument.Bookmarks.Item("title").Range.InsertBefore(exparam.tempdata.exporttitle);
				}
				if (myDocument.Bookmarks.Exists("smalltitle")){
					myDocument.Bookmarks.Item("smalltitle").Range.InsertBefore(leadername+" "+starttime.split("-")[0] + "年" +starttime.split("-")[1] + "月"	+ starttime.split("-")[2] + "日" + "---"	+(endtime.split("-")[0]==starttime.split("-")[0]?"":(endtime.split("-")[0]+"年"))+ endtime.split("-")[1] + "月" + endtime.split("-")[2] + "日");
				}
				table = myDocument.Tables.Item(1);
				table.Rows.Item(p).Select();
			}else{
				if (myDocument.BookMarks.Exists("title")){
					myDocument.Bookmarks("title").Range.InsertBefore(exparam.tempdata.exporttitle);
				}
				if (myDocument.BookMarks.Exists("smalltitle")){
					myDocument.Bookmarks("smalltitle").Range.InsertBefore(starttime.split("-")[0] + "年" +starttime.split("-")[1] + "月"	+ starttime.split("-")[2] + "日" + "---"	+(endtime.split("-")[0]==starttime.split("-")[0]?"":(endtime.split("-")[0]+"年"))+ endtime.split("-")[1] + "月" + endtime.split("-")[2] + "日");
				}
				table = myDocument.Tables(1);
				table.Rows(p).Select();
			}
			// 主要 一周
			var rowcount = 7;
			// 插入的行数
			if ((rowcount - 1) != 0) {
				myDocApp.Selection.InsertRowsBelow(rowcount - 1);
			}

			var weeklength = 0;
			var week = [];
			var bean = {};
			for(var r = 0;r<result.length;r++){
				var sw = 0;
				var xw = 0;
				var ws = 0;
				if(result[r]!=null && result[r].num!="" && result[r].activitypm=="1"){
					sw = result[r].num;
					bean.swdata = sw;
				}
				if(result[r+sw]!=null && result[r+sw].num!="" && result[r+sw].activitypm=="2"){
					xw = result[r+sw].num;
					bean.xwdata = xw;
				}
				if(result[r+sw+xw]!=null && result[r+sw+xw].num!="" && result[r+sw+xw].activitypm=="3"){
					ws = result[r+sw+xw].num;
					bean.wsdata = ws;
				}
				week[weeklength] = bean;
				weeklength++;
				bean = {};
				r = r+(sw-1)+xw+ws;
			}
			// 临时行数
			// 一周表
			var daynum = 0;
			for(var t = 0;t<rowcount;t++){
				if(headers["dateday"]){
			 	 	var ftype = headers["dateday"].ftype;
					var cellnum = headers["dateday"].cellnum;
			 		var datime = LBCP.DocumentView.getWeek(result[daynum].startdate)+"\n";
			 		if(ftype && ftype.indexOf("月")!=-1 && ftype.indexOf("日")!=-1 ){
			 			datime =  LBCP.DocumentView.setFormat(result[daynum].startdate);
			 			if(ftype.indexOf("星期")!=-1){
			 				datime += "\n" + LBCP.DocumentView.getWeek(result[daynum].startdate,1);
			 			}
			 		}
						// 拆分前插入必要数据
			 		if(week[t].swdata>22||week[t].xwdata>22||week[t].wsdata>22){
	   					table.Cell(p + daynum, cellnum).Range.InsertAfter("\r\n" +"\r\n" +"\r\n" +"\r\n" + datime + "\r\n"+ "\r\n"+ "\r\n"+ "\r\n");
	   				}else{
	   					if(week[t].swdata>18||week[t].xwdata>18||week[t].wsdata>18){
	   						table.Cell(p + daynum, cellnum).Range.InsertAfter("\r\n" +"\r\n" +"\r\n" + datime + "\r\n"+ "\r\n"+ "\r\n");
	   					}else{
	   						if(week[t].swdata>12||week[t].xwdata>12||week[t].wsdata>12){
			   					table.Cell(p + daynum, cellnum).Range.InsertAfter("\r\n" +"\r\n" + datime + "\r\n"+ "\r\n");
			   				}else{
			   					if((week[t].swdata+week[t].xwdata+week[t].wsdata)==1){
			   						table.Cell(p + daynum, cellnum).Range.InsertAfter(datime);	
			   					}else{
			   						table.Cell(p + daynum, cellnum).Range.InsertAfter("\r\n" +datime+ "\r\n");
			   					}
			   				}		   						
	   					}
	   				}
				 }
				 //拆分时段单元格
				for(var z=1;z<=table.Columns.Last.Index;z++){
					var cellnum = headers["dateday"]?headers["dateday"].cellnum:0;
					if(z!=cellnum){
						table.Cell(p + daynum, z).Split(3, 1);
					}
				}
				//上午下午晚上
   				for(var m = 0;m<3;m++){
   					//插入时段
   					if(headers["swxw"]){
   						var cellnum = headers["swxw"].cellnum;
					 	var ismergecell = headers["swxw"].ismergecell;
					 	table.Cell(p + daynum, cellnum).Range.InsertAfter(result[daynum].activitypm=="1"?"上午":(result[daynum].activitypm=="2"?"下午":(result[daynum].activitypm=="3"?"晚上":"全天")));
   					}
   					if(result[daynum].num!=""){
   						var datanum = parseInt(result[daynum].num);
   						if(datanum>1){
   							//拆分后面数据单元格
   							for(var y=1;y<=table.Columns.Last.Index;y++){
   								var cnum1 = headers["dateday"]?headers["dateday"].cellnum:0;
   								var cnum2 = headers["swxw"]?headers["swxw"].cellnum:0
   								if(y!=cnum1&&y!=cnum2){
   									table.Cell(p + daynum, y).Split(datanum, 1);
   								}
   							}
   						}
   						//每个时段的每条数据
   						for (var j = 0; j < datanum; j++) {
   							if(headers["datetime"]){
   								var time = "";
   								var ftype = headers["datetime"].ftype;
   								var cellnum = headers["datetime"].cellnum;
   								var ismergecell = headers["datetime"].ismergecell;
   								var swxw = result[daynum].activitypm=="1"?"上午":(result[daynum].activitypm=="2"?"下午":(result[daynum].activitypm=="3"?"晚上":"全天"));
   	   							if(result[daynum].activityname&&result[daynum].id){//"机关办公休息".indexOf(result[daynum].activityname)==-1
	   	   							if(swxw=="全天"){
										table.Cell(p + daynum, cellnum).Range.InsertAfter("");
									}else{
									 	var hour = result[daynum].hourselect;
									 	var minite = result[daynum].miniteselect;
									 	if(!ftype||ftype=="24h"){
									 		if(hour <10){
								 				hour = "0"+hour;
								 			}
								 			if(minite <10){
								 				minite = "0"+minite;
								 			}
									 		time = hour +":"+ minite;
									 		table.Cell(p + daynum, cellnum).Range.InsertAfter(time);
									 	}else{
									 		if(hour >12){
									 			hour -= 12;
									 		}
								 			if(minite <10){
								 				minite = "0"+minite;
								 			}
									 		time = (hour<10?"0"+hour:hour) +":"+ minite;
									 		if(ftype && ftype.indexOf("--")!=-1){
										 		if(result[daynum].enddate){
										 			var eh = parseInt(result[daynum].enddate.substring(11,13));
										 			var eswxw = "";
													if(eh<=12){
														eswxw = "上午";
													}else{
														if(hour==12&&swxw=="上午"){
															swxw = "中午";
														}
														if(eh<18){
															eswxw = "下午";
														}else{
															if(eh==18&&swxw!="晚上"){
																eswxw = "下午";
															}else{
																eswxw = "晚上";
															}
														}
														eh-=12;
													}
													if(swxw==eswxw){
														eswxw="";
													}
										 			var edate = " -- " + eswxw+(eh<10?"0"+eh:eh)+result[daynum].enddate.substring(13,16) +"时";
										 			table.Cell(p + daynum, cellnum).Range.InsertAfter( swxw + time +"时" + edate);
										 		}else{
										 			table.Cell(p + daynum, cellnum).Range.InsertAfter( swxw + time +"时");
										 		}
										 	}else{
										 		table.Cell(p + daynum, cellnum).Range.InsertAfter(time);
										 	}
									 	}
									}
   	   							}else{
   	   								table.Cell(p + daynum, cellnum).Range.InsertAfter(swxw);
   	   							}
   							}
   							if(headers["activityname"]){
   								var ftype = headers["activityname"].ftype;
								var cellnum = headers["activityname"].cellnum;
							 	var ismergecell = headers["activityname"].ismergecell;
   								table.Cell(p + daynum, cellnum).Range.InsertAfter(result[daynum].activityname);
   							}
   							if(headers["address"]){
   								var ftype = headers["address"].ftype;
								var cellnum = headers["address"].cellnum;
							 	var ismergecell = headers["address"].ismergecell;
   								table.Cell(p + daynum, cellnum).Range.InsertAfter(result[daynum].address);
   							}
   							if(headers["printleader"]){
   								var ftype = headers["printleader"].ftype;
								var cellnum = headers["printleader"].cellnum;
							 	var ismergecell = headers["printleader"].ismergecell;
							 	var leaders = "";
								if(result[daynum].printleader){
									leaders = result[daynum].printleader;
								}
								if(result[daynum].antherleader){
									if(leaders !=""){
										leaders += "," +result[daynum].antherleader;
									}else{
										leaders = result[daynum].antherleader;
									}
								}
   								table.Cell(p + daynum, cellnum).Range.InsertAfter(leaders);
   							}
   							if(headers["unitleader"]){
   								var ftype = headers["unitleader"].ftype;
							 	var cellnum = headers["unitleader"].cellnum;
								var ismergecell = headers["unitleader"].ismergecell;
								var leaders = "";
								if(result[daynum].unitleader){
									leaders = result[daynum].unitleader;
								}
								if(result[daynum].antherleader){
									if(leaders !=""){
										leaders += "," +result[daynum].antherleader;
									}else{
										leaders = result[daynum].antherleader;
									}
								}
   								table.Cell(p + daynum, cellnum).Range.InsertAfter(leaders);
   							}
   							if(headers["maindept"]){
   								var ftype = headers["maindept"].ftype;
								var cellnum = headers["maindept"].cellnum;
							 	var ismergecell = headers["maindept"].ismergecell;
   								table.Cell(p + daynum, cellnum).Range.InsertAfter(result[daynum].maindept);
   							}
   							if(headers["remarks"]){
   								var ftype = headers["remarks"].ftype;
								var cellnum = headers["remarks"].cellnum;
							 	var ismergecell = headers["remarks"].ismergecell;
   								table.Cell(p + daynum, cellnum).Range.InsertAfter(result[daynum].remarks);
   							}
   							if(headers["dutyleader"]){
   								var ftype = headers["dutyleader"].ftype;
   								var cellnum = headers["dutyleader"].cellnum;
							 	var ismergecell = headers["dutyleader"].ismergecell;
							 	var leaders = result[daynum].dutyleader;
   								if(ftype){
									var flag = "";
									flag = ftype.charAt("2");
									if(leaders&&flag){
										leaders = leaders.replace(/\//g,",").replace(/、/g,",").replace(/,/,flag);
									}
								}
   								table.Cell(p + daynum, cellnum).Range.InsertAfter(leaders);
   							}
   							daynum++;
   						}
   					}
   				}
			}
		} catch (e) {
			alert(e.description);
		} finally {
			myDocApp = myDocument = range = opinions = arr = table = i = op = row = k = sq = pagesCount = idx = rg = row = sqIdx = bonds = _idx = daynum = null;
		}
	
}

LBCP.DocumentView.__afterOpenZWAPTemplete_office_newformat = function(template, dispApp, myDocument, activedocument,exparam) {
	try {
		var myDocApp = null;
		if(exparam.iswps){
			myDocApp = activedocument;
		}else{
			if (myDocument == null) {
				myDocApp = new ActiveXObject("word.Application"); // mydocapp就是这个
				if (dispApp == true)
					myDocApp.Application.Visible = true;
				myDocument = myDocApp.Documents.Open(template);
			} else {
				myDocApp = myDocument.application;
			}
		}
		var result = exparam.resultdata.result;
		var starttime = exparam.tempdata.weekstart;
		var endtime = exparam.tempdata.weekend;
		var type = exparam.tempdata.exporttype;//0 按日期 1 按领导
		var weekEname = ["monday", "tuesday", "wednesday", "thursday", "friday","saturday", "sunday"];
		var weekname = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"];
		var daytimes = exparam.daytimes;
		if(exparam.iswps || LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
			if (myDocument.Bookmarks.Exists("title")){
				myDocument.Bookmarks.Item("title").Range.InsertBefore(exparam.tempdata.exporttitle);
			}
			if (myDocument.Bookmarks.Exists("smalltitle")){
				myDocument.Bookmarks.Item("smalltitle").Range.InsertBefore(starttime.split("-")[0] + "年" +starttime.split("-")[1] + "月"	+ starttime.split("-")[2] + "日" + "---"	+(endtime.split("-")[0]==starttime.split("-")[0]?"":(endtime.split("-")[0]+"年"))+ endtime.split("-")[1] + "月" + endtime.split("-")[2] + "日");
			}
		}else{
			if (myDocument.Bookmarks.Exists("title")){
				myDocument.Bookmarks("title").Range.InsertBefore(exparam.tempdata.exporttitle);
			}
			if (myDocument.Bookmarks.Exists("smalltitle")){
				myDocument.Bookmarks("smalltitle").Range.InsertBefore(starttime.split("-")[0] + "年" +starttime.split("-")[1] + "月"	+ starttime.split("-")[2] + "日" + "---"	+(endtime.split("-")[0]==starttime.split("-")[0]?"":(endtime.split("-")[0]+"年"))+ endtime.split("-")[1] + "月" + endtime.split("-")[2] + "日");
			}
		}
		//数据加工
		var indexs = [];
		for(var i=0;i<result.length;i++){
			if(result[i].activitypm!=1){
				var num = 0;
				if(result[i].activitypm==2){
					num = 1;
				}
				if(result[i].activitypm==3){
					num = 2;
				}
				if(result[i].monday){
					if(result[i-num].monday){
						result[i-num].monday = result[i-num].monday.concat(result[i].monday);
					}else{
						result[i-num].monday = result[i].monday;
					}
				}
				if(result[i].tuesday){
					if(result[i-num].tuesday){
						result[i-num].tuesday = result[i-num].tuesday.concat(result[i].tuesday);
					}else{
						result[r-1].tuesday = result[r].tuesday;
					}
				}
				if(result[i].wednesday){
					if(result[i-num].wednesday){
						result[i-num].wednesday = result[i-num].wednesday.concat(result[i].wednesday);
					}else{
						result[i-num].wednesday = result[i].wednesday;
					}
				}
				if(result[i].thursday){
					if(result[i-num].thursday){
						result[i-num].thursday = result[i-num].thursday.concat(result[i].thursday);
					}else{
						result[i-num].thursday = result[i].thursday;
					}
				}
				if(result[i].friday){
					if(result[i-num].friday){
						result[i-num].friday = result[i-num].friday.concat(result[i].friday);
					}else{
						result[i-num].friday = result[i].friday;
					}
				}
				if(result[i].saturday){
					if(result[i-num].saturday){
						result[i-num].saturday = result[i-num].saturday.concat(result[i].saturday);
					}else{
						result[i-num].saturday = result[i].saturday;
					}
				}
				if(result[i].sunday){
					if(result[i-num].sunday){
						result[i-num].sunday = result[i-num].sunday.concat(result[i].sunday);
					}else{
						result[i-num].sunday = result[i].sunday;
					}
				}
				indexs.push(i);
			}
		}
		if(indexs.length>0){
			for(var a=indexs.length-1;a>=0;a--){
				result.splice(indexs[a],1);
			}
		}
		var pointer = 0;
		if(type==0){
			for(var i=0;i<7;i++){
				var week = daytimes[i].replace(/\s+/g,"")+"（"+weekname[i]+"）\r";
				var range = myDocApp.ActiveDocument.Range(pointer,pointer+week.length);
				range.Font.Size = 14;
				range.Bold = true;
				range.InsertAfter(week);
				pointer += week.length;
				
				for(var j=0;j<result.length;j++){
					var day = null;
					var str = result[j].name+"：";
					if(weekEname[i]=="monday"){
						data = result[j].monday;
					}else if(weekEname[i]=="tuesday"){
						data = result[j].tuesday;
					}else if(weekEname[i]=="wednesday"){
						data = result[j].wednesday;
					}else if(weekEname[i]=="thursday"){
						data = result[j].thursday;
					}else if(weekEname[i]=="friday"){
						data = result[j].friday;
					}else if(weekEname[i]=="saturday"){
						data = result[j].saturday;
					}else if(weekEname[i]=="sunday"){
						data = result[j].sunday;
					}
					if(data&&data.length>0){
						for(var k=0;k<data.length;k++){
							var time = data[k].startdate.substring(11,16)+" ";
							str += time+data[k].activityname+"。";
						}
					}
					str += "\r";
					var range2 = myDocApp.ActiveDocument.Range(pointer,pointer+str.length);
					range2.Font.Size = 14;
					range2.Bold = false;
					range2.InsertAfter(str);
					pointer += str.length;
				}
			}
		}else if(type==1){
			for(var i=0;i<result.length;i++){
				var name = result[i].name+"\r";
				var range = myDocApp.ActiveDocument.Range(pointer,pointer+name.length);
				range.Font.Size = 14;
				range.Bold = true;
				range.InsertAfter(name);
				pointer += name.length;
				var data = [];
				if(result[i].monday){
					data = data.concat(result[i].monday);
				}
				if(result[i].tuesday){
					data = data.concat(result[i].tuesday);
				}
				if(result[i].wednesday){
					data = data.concat(result[i].wednesday);
				}
				if(result[i].thursday){
					data = data.concat(result[i].thursday);
				}
				if(result[i].friday){
					data = data.concat(result[i].friday);
				}
				if(result[i].saturday){
					data = data.concat(result[i].saturday);
				}
				if(result[i].sunday){
					data = data.concat(result[i].sunday);
				}
				if(data&&data.length>0){
					for(var j=0;j<data.length;j++){
						var str = "";
						var mouth = data[j].startdate.substring(5,7);
						if(mouth.startsWith("0")){
							mouth = mouth.replace("0","");
						}
						var day = data[j].startdate.substring(8,10);
						if(day.startsWith("0")){
							day = day.replace("0","");
						}
						str += mouth+"月"+day+"日";
						var pm = "全天";
						if(data[j].activitypm==1){
							pm = "上午";
						}else if(data[j].activitypm==2){
							pm = "下午";
						}else if(data[j].activitypm==3){
							pm = "晚上";
						}
						str += pm;
						var time = data[j].startdate.substring(11,16)+" ";
						str += time+data[j].activityname;
						if(j+1<data.length){
							str += "；\r";
						}else{
							str += "。\r"
						}
						var range2 = myDocApp.ActiveDocument.Range(pointer,pointer+str.length);
						range2.Font.Size = 14;
						range2.Bold = false;
						range2.InsertAfter(str);
						pointer += str.length;
					}
				}
			}
		}
	} catch (e) {
		alert(e.description);
	} finally {
		myDocApp = myDocument = Range = opinions = arr = table = i = op = row = k = sq = pagesCount = idx = rg = row = sqIdx = bonds = _idx = null;
	}

}

LBCP.DocumentView.afterOpenZWAPTemplete_wpsAddon= function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	myDocument.TrackRevisions = false;
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");
	//插入文本
	if (myParam.EntityBeans)
	{
		myParam.EntityBeans.iswps = true;
		LBCP.DocumentView.__afterOpenZWAPTemplete_office(null, true, myDocument, myDocApp,myParam.EntityBeans);
	}	
	
}

LBCP.DocumentView.afterOpenZWAPTemplete_wpsAddon_leader= function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	myDocument.TrackRevisions = false;
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");
	//插入文本
	if (myParam.EntityBeans)
	{
		myParam.EntityBeans.iswps = true;
		LBCP.DocumentView.__afterOpenZWAPTemplete_office_leader(null, true, myDocument, myDocApp,myParam.EntityBeans);
	}	
	
}

LBCP.DocumentView.afterOpenZWAPTemplete_wpsAddon_person= function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	myDocument.TrackRevisions = false;
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");
	//插入文本
	if (myParam.EntityBeans)
	{
		myParam.EntityBeans.iswps = true;
		LBCP.DocumentView.__afterOpenZWAPTemplete_office_person(null, true, myDocument, myDocApp,myParam.EntityBeans);
	}	
	
}

LBCP.DocumentView.afterOpenZWAPTemplete_wpsAddon_newformat= function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	myDocument.TrackRevisions = false;
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");
	//插入文本
	if (myParam.EntityBeans)
	{
		myParam.EntityBeans.iswps = true;
		LBCP.DocumentView.__afterOpenZWAPTemplete_office_newformat(null, true, myDocument, myDocApp,myParam.EntityBeans);
	}	
	
}

LBCP.DocumentView.Tablesplitfunc = function(table,headers,mdname,rownum,splitcount){
	var ftype = headers[mdname].ftype;
	var cellnum = headers[mdname].cellnum;
 	var ismergecell = headers[mdname].ismergecell;
 	table.Cell(rownum, cellnum).Split(splitcount, 1);
}

LBCP.DocumentView.setFormat = function(startdate){
	var mouth = startdate.substring(5,7);
	if(mouth.startsWith("0")){
		mouth = mouth.replace("0","");
	}
	var day = startdate.substring(8,10);
	if(day.startsWith("0")){
		day = day.replace("0","");
	}
	return mouth+" 月 "+day+" 日";
}
	
	//type=1,返回周几，2返回完整日期
LBCP.DocumentView.getWeek = function(date,type){
	date = date.substring(0,10);
	var weekDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    var dateStr = date;
    var myDate = new Date(Date.parse(dateStr.replace(/-/g, "/")));
    if(type==1){
		return weekDay[myDate.getDay()];
    }else{
		return date;
    }
}


/**
 * 国产化名牌打印方法
 */
LBCP.DocumentView.printNameCard = function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");
	//插入文本
	if (myParam.EntityBeans){
		var wdCharacter=1;
		var wdOrientLandscape = 1;
		var Selection = myDocument.ActiveWindow.Selection;
		var leaderNames = myParam.EntityBeans.printdata.leadernames;
		this.printFont = myParam.EntityBeans.printdata.printFont;
		this.printSize = myParam.EntityBeans.printdata.printsize;
		var size = 0;
		var left=0;
		var top1=0;
		var top2=0;
		var font="华文行楷";
		for(i=0;i<leaderNames.length-1;i++){
			var name = leaderNames[i].trim();
			if(name=="")continue;
			if(name.length==2)name=name.substring(0,1)+"　"+name.substring(1);
			if(this.printSize==1){
				size=165;
				left=60;
				top1=60;
				top2=300;
			}else if(this.printSize==2){
				size=155;
				left=65;
				top1=35;
				top2=295;
			}else if(this.printSize==3){
				size=145;
				left=75;
				top1=40;
				top2=290;
			}
			/*if(name.indexOf("湧")>-1){
				font="华文中宋";
			}else
				font="华文行楷";*/
			if(name.indexOf("湧")>-1){
				font="华文中宋";
			}else{
				if(this.printFont==1){//市
					font="方正小标宋 GBK";
				}else if(this.printFont==2){//区
					font="华文行楷";
				}
			}
				
			Selection.MoveRight(1);
			Selection.InsertRows(1);
			if(this.printFont==1){
				var myBox = myDocument.Shapes.AddTextEffect(0,"赵钱孙",font,size,1,0,left,top1);
			}else if(this.printFont==2){//区
				var myBox = myDocument.Shapes.AddTextEffect(0,"赵钱孙",font,size,0,0,left,top1);
			}else{
				var myBox = myDocument.Shapes.AddTextEffect(0,"赵钱孙",font,size,0,0,left,top1);
			}
			myBox.Fill.Visible = -1;
		    myBox.Rotation = 180;
			myBox.TextEffect.Text = name;
			myBox.Fill.ForeColor.RGB = 0;
			if(this.printFont==1){
				var myBoxA = myDocument.Shapes.AddTextEffect(0,"赵钱孙",font,size,1,0,left,top2);
			}else if(this.printFont==2){//区
				var myBoxA = myDocument.Shapes.AddTextEffect(0,"赵钱孙",font,size,0,0,left,top2);
			}else{//区
				var myBoxA = myDocument.Shapes.AddTextEffect(0,"赵钱孙",font,size,0,0,left,top2);
			}
			myBoxA.Fill.Visible = -1;
			myBoxA.TextEffect.Text = name;
			myBoxA.Fill.ForeColor.RGB = 0;
			
			if(leaderNames.length == 2){
				continue;
			} else if(i == leaderNames.length - 2){
				continue;
			} else {
				Selection.MoveRight(1);
				Selection.InsertRows(1);
			}
		}
	}
}

/**
 * 通过url获取打印数据
 * @param {} url
 * @param {} id
 * @return {}
 */
LBCP.DocumentView._UrlGetPrintData = function(url,id){
    var h = null;
	if (window.ActiveXObject) {
		h = new ActiveXObject("Msxml2.XMLHTTP");
	} else {
		if (window.XMLHttpRequest) {
			h = new XMLHttpRequest();
			if (h.overrideMimeType) {
				h.overrideMimeType("text/xml");
			}
		}
	}
	h.open("GET", url +"?id="+id, false);
	//h.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	h.send();
	var d = null;
	if (h.status == 200) {
		if(h.responseText){
			d = JSON.parse(h.responseText);
		}		
	}
	delete h;
	return d;
	    
}

/**
 * 南山信息转发文
 */
LBCP.DocumentView.afterOpenMyTemplate_wpsAddon_nxss =  function(){
	
	// alert("调用了 LBCP.DocumentView.afterOpenMyTemplate 方法");
	// 获取activeDocument
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	
	// 获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");
		
	// 插入文本
	if (myParam.EntityBeans){
		try {
    	
    	process.SetDocParamsValue(myDocument, PARAM_Enum.ignoreBeforeSave, true); 

    	var exparam = myParam.EntityBeans;
    	
        var imgtype = null; // 二维码图片格式
        var json = exparam.printdata;
        for (var key in json) {
            if (myDocument.Bookmarks.Exists(key)) {
                myDocument.Bookmarks.Item(key).Range.InsertBefore(json[key]);
            }
        }

        if(exparam.printdata.selectldps && exparam.printdata.result){
        	 var table = myDocument.Tables.Item(1);
        	 var opinions = exparam.printdata.selectldps;
            var  list= exparam.printdata.result;
            var p = 4;
     		for (var g = 0; g < list.length; g++) {				
     			var mdid = list[g].id;
     			var title = list[g].title;
     			// var index = 0;
     			var arr = exparam.printdata.selectldps;
     			table.Rows.Item(p).Select();
     			var infonum = 0;
     			for (var h = 0; h < arr.length; h++) {
     				if (arr[h].entrymdid == mdid) {
     					infonum += 1;
     				}
     			}
     			if (infonum == 0) {
					myDocApp.Selection.InsertRowsBelow(1);
					var row = table.Rows.Item(p);
					 row.Cells.Item(1).Range.ParagraphFormat.Alignment = 0;
					row.Cells.Item(1).RightPadding = 20;
					strs = g + 1 + "." + title + "\r\n\r\n" 
					row.Cells.Item(1).Range.InsertAfter(strs);
					p += 1;
     			}
     			myDocApp.Selection.InsertRowsBelow(infonum * 2);
     			var num = 0;
     			for (var i = 0; i < arr.length; i++) {					
     				var op = arr[i];
     				if (op.entrymdid == mdid) {
     					// index += 1;
     					
     					var row = table.Rows.Item(p + num * 2);
     					//row.Cells.Merge();
     					 row.Cells.Item(1).Range.ParagraphFormat.Alignment = 0;
     					var strs = "";
     					var contents = op.opinioncontent.split("\r\n");
     					for (var j = 0; j < contents.length; j++) {
     						if (contents[j] != null && contents[j] != "" && strs == "" && num == 0) {																		
     							strs = g + 1 + "." + title + "\r\n\r\n" + "    " + contents[j].trim();
     							num += 1;	
     						} else if (contents[j] != null && contents[j] != "" && strs == "" && num > 0) {
     							strs = "    " + contents[j].trim();
     							num += 1;
     						} else if (contents[j] != null && contents[j] != "") {
     							strs = strs + "\r\n" + "    " + contents[j].trim();
     						}
     					}
     					row.Cells.Item(1).Range.InsertAfter(strs);
     					var row = table.Rows.Item(p + (num-1) * 2 + 1);
     					//row.Cells.Merge();
     					 row.Cells.Item(1).Range.ParagraphFormat.Alignment = 2;
     					row.Cells.Item(1).RightPadding = 20;
     					var str = op.username + "  " + op.opiniondate + "\r\n";
     					row.Cells.Item(1).Range.InsertAfter(str);
     				}					
     			}
     			p += infonum * 2;				
     		}
        }
       	
    } finally {
        myDocApp = myDocument = Range = opinions = arr = table = i = op = row = k = sq = pagesCount = idx = rg = row = sqIdx = bonds = _idx = null;
    }
	}	
}

//会议模板导出龙岗需求
LBCP.DocumentView.HYPZExportWord_HYTZ = function(meetingdata,title,domain,configparam){
	var url = leapconfig.server + "LEAP/LOAP/LOAPGovHyxt/HYXT/hydcpz/hydcpzhytztemplet.doc";
	if(url.indexof("?")!=-1){
		if(url.indexof("sid=") ==-1){
			url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
	}else{
		url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
	}
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		var param = {docType:LEAP.WPSAddon.docType.wps,
					docId: UUID.randomUUID(),
				    fileTitle: title,
				    fileName: url,
				    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
				    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
				    customAfterOpenFn: "LBCP.DocumentView.afterOpenHYPZDCTemplete_wpsAddon_HYTZ", 
				    buttons: "submit,saveAs",
				    customButtons: null,
				    waterMark: null,
				    exparam:{myBookmarks:null,EntityBeans:{meetingdata:meetingdata,configparam:configparam}},
					notifyFn:null,
					domain:domain
				};
				
		LEAP.WPSAddon.OpenDocument(param);
	}else{
		var _form = domain.loadForm('loapprint', '打印');
	    LEAP.form.maxSize(_form.form);
	    //判断是不是用了iweboffice
	    var afterloadfn = LBCP.DocumentView.afterOpenHYPZDCTemplete_office_HYTZ;
	    var par = {
	        url: url,
	        afterload: afterloadfn,
	        buttons: "saveAs,print",
	        exparam:{domain:domain,meetingdata:meetingdata,configparam:configparam}
	    };
	    LEAP.asyn(_form.module.init, _form.module, 500, par, domain);
	}
}

LBCP.DocumentView.afterOpenHYPZDCTemplete_wpsAddon_HYTZ = function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	myDocument.TrackRevisions = false;
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");
	//插入文本
	if (myParam.EntityBeans)
	{
		myParam.EntityBeans.iswps = true;
		LBCP.DocumentView.__afterOpenHYPZDCTemplete_office_HYTZ(null, true, myDocument, myDocApp,myParam.EntityBeans);
	}	
	
}

LBCP.DocumentView.afterOpenHYPZDCTemplete_office_HYTZ = function(myDocument, activedocument,exparam) {
    return LBCP.DocumentView.__afterOpenHYPZDCTemplete_office_HYTZ(null, true, myDocument, activedocument,exparam);
}

LBCP.DocumentView.__afterOpenHYPZDCTemplete_office_HYTZ = function(template, dispApp, myDocument, activedocument,exparam) {
		try {
			var myDocApp = null;
			if(exparam.iswps){
				myDocApp = activedocument;
			}else{
				if (myDocument == null) {
					myDocApp = new ActiveXObject("word.Application"); // mydocapp就是这个
					if (dispApp == true)
						myDocApp.Application.Visible = true;
					myDocument = myDocApp.Documents.Open(template);
				} else {
					myDocApp = myDocument.application;
				}
			}
			
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth()+1;
			var day = date.getDate();
			
			var meetingdata = exparam.meetingdata;
			var configparam = exparam.configparam;
			if(meetingdata){
				if(meetingdata.hyytinfo){
					meetingdata.hyytinfo = "\t\t"+meetingdata.hyytinfo;
				}
				if(exparam.iswps || LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
					if (myDocument.Bookmarks.Exists("meetingtitle")){
						myDocument.Bookmarks.Item("meetingtitle").Range.InsertBefore(meetingdata.meetingtitle);
					}
					if (myDocument.Bookmarks.Exists("meetingtime")){
						myDocument.Bookmarks.Item("meetingtime").Range.InsertBefore(meetingdata.meetingtime);
					}
					if (myDocument.Bookmarks.Exists("meetingaddress")){
						myDocument.Bookmarks.Item("meetingaddress").Range.InsertBefore(meetingdata.meetingaddress);
					}
					if (myDocument.Bookmarks.Exists("hyytinfo")){
						myDocument.Bookmarks.Item("hyytinfo").Range.InsertBefore(meetingdata.hyytinfo);
					}
					if (myDocument.Bookmarks.Exists("lxldnum") && meetingdata.lxldnum){
						myDocument.Bookmarks.Item("lxldnum").Range.InsertBefore(meetingdata.lxldnum);
					}
					if (myDocument.Bookmarks.Exists("lxldstr") && meetingdata.lxldstr){
						var lxldname = meetingdata.lxldstr+"同志。";
						var start = myDocument.Bookmarks.Item("lxldstr").Range.Start;
						myDocument.Bookmarks.Item("lxldstr").Range.InsertBefore(lxldname);
						var lxldrange = myDocApp.ActiveDocument.Range(start,start+lxldname.length);
						lxldrange.Bold = false;
					}
					if (myDocument.Bookmarks.Exists("qclx") && meetingdata.qclx){
						var range = myDocument.Bookmarks.Item("qclx").Range;
						var start = range.Start;
						range.InsertAfter(meetingdata.qclx);
						var range2 = myDocApp.ActiveDocument.Range(start,start+meetingdata.qclx.length)
						range2.Bold = false;
					}
					if(myDocument.Bookmarks.Exists("cjryinfo") && meetingdata.lxytnum && meetingdata.lxytnum.length>0){
						var start = myDocument.Bookmarks.Item("cjryinfo").Range.Start;
						var lxytnum = meetingdata.lxytnum;
						var lxytstr;
						if(meetingdata.lxytstr&&meetingdata.lxytstr.length>0){
							lxytstr = meetingdata.lxytstr;
						}
						for(var a=0;a<lxytnum.length;a++){
							var num = "\t\t"+lxytnum[a];
							var str = num;
							
							if(lxytstr[a]){
								str += lxytstr[a];
							}
							
							if(a+1<lxytnum.length){
								str += "\r";
							}
							
							var range = myDocApp.ActiveDocument.Range(start,start+str.length);
							range.InsertBefore(str);
							
							var numrange = myDocApp.ActiveDocument.Range(start,start+num.length);
							numrange.Bold = true;
							start += str.length;
						}
					}
					if(myDocument.Bookmarks.Exists("placeinfo") && meetingdata.place && meetingdata.place.length>0){
						var start = myDocument.Bookmarks.Item("placeinfo").Range.Start;
						var place = meetingdata.place;
						var placestr = meetingdata.placestr;
						for(var a=0;a<place.length;a++){
							var str = "";
							str += "请";
							if(placestr[a]){
								str += placestr[a];
							}
							str += "在";
							var pstartnum = start+str.length;
							var pendnum = pstartnum;
							if(place[a]){
								str += place[a];
								pendnum += place[a].length
							}
							str += "参会；";
							if(a+1<place.length){
								str += "\r";
							}
							var range = myDocApp.ActiveDocument.Range(start,start+str.length);
							range.InsertBefore(str);
							range.Bold = false;
							
							var numrange = myDocApp.ActiveDocument.Range(pstartnum,pendnum);
							numrange.Bold = true;
							start += str.length;
						}
					}
					if (myDocument.Bookmarks.Exists("zytx") && meetingdata.zytx){
						myDocument.Bookmarks.Item("zytx").Range.InsertBefore(meetingdata.zytx);
					}
					if (myDocument.Bookmarks.Exists("xcbd") && meetingdata.xcbd){
						myDocument.Bookmarks.Item("xcbd").Range.InsertBefore(meetingdata.xcbd);
					}
					if (myDocument.Bookmarks.Exists("lxr") && meetingdata.lxr){
						myDocument.Bookmarks.Item("lxr").Range.InsertBefore(meetingdata.lxr);
					}
					if (myDocument.Bookmarks.Exists("lxdh") && meetingdata.lxdh){
						myDocument.Bookmarks.Item("lxdh").Range.InsertBefore(meetingdata.lxdh);
					}
					if (myDocument.Bookmarks.Exists("bullettime")){
						myDocument.Bookmarks.Item("bullettime").Range.InsertBefore(meetingdata.bullettime);
					}
					if (myDocument.Bookmarks.Exists("year")){
						myDocument.Bookmarks.Item("year").Range.InsertBefore(year);
					}
					if (myDocument.Bookmarks.Exists("month")){
						myDocument.Bookmarks.Item("month").Range.InsertBefore(month);
					}
					if (myDocument.Bookmarks.Exists("day")){
						myDocument.Bookmarks.Item("day").Range.InsertBefore(day);
					}
					if (myDocument.Bookmarks.Exists("hwbzlxr")){
						myDocument.Bookmarks.Item("hwbzlxr").Range.InsertBefore(configparam.hwbzlxr);
					}
					if (myDocument.Bookmarks.Exists("hwbzlxdh")){
						myDocument.Bookmarks.Item("hwbzlxdh").Range.InsertBefore(configparam.hwbzlxdh);
					}
				}else{
					if (myDocument.Bookmarks.Exists("meetingtitle")){
						myDocument.Bookmarks("meetingtitle").Range.InsertBefore(meetingdata.meetingtitle);
					}
					if (myDocument.Bookmarks.Exists("meetingtime")){
						myDocument.Bookmarks("meetingtime").Range.InsertBefore(meetingdata.meetingtime);
					}
					if (myDocument.Bookmarks.Exists("meetingaddress")){
						myDocument.Bookmarks("meetingaddress").Range.InsertBefore(meetingdata.meetingaddress);
					}
					if (myDocument.Bookmarks.Exists("hyytinfo")){
						myDocument.Bookmarks("hyytinfo").Range.InsertBefore(meetingdata.hyytinfo);
					}
					if (myDocument.Bookmarks.Exists("lxldnum") && meetingdata.lxldnum){
					    myDocument.Bookmarks("lxldnum").Range.InsertBefore(meetingdata.lxldnum);
					}
					if (myDocument.Bookmarks.Exists("lxldstr") && meetingdata.lxldstr){
					    var lxldname = meetingdata.lxldstr+"同志。";
					    var start = myDocument.Bookmarks("lxldstr").Range.Start;
					    myDocument.Bookmarks("lxldstr").Range.InsertBefore(lxldname);
					    var lxldrange = myDocApp.ActiveDocument.Range(start,start+lxldname.length);
					    lxldrange.Bold = false;
					}
					if (myDocument.Bookmarks.Exists("qclx") && meetingdata.qclx){
						var range = myDocument.Bookmarks("qclx").Range;
						var start = range.Start;
						range.InsertBefore(meetingdata.qclx);
						var range2 = myDocApp.ActiveDocument.Range(start,start+meetingdata.qclx.length)
						range2.Bold = false;
					}
					if(myDocument.Bookmarks.Exists("cjryinfo") && meetingdata.lxytnum && meetingdata.lxytnum.length>0){
					    var start = myDocument.Bookmarks("cjryinfo").Range.Start;
					    var lxytnum = meetingdata.lxytnum;
					    var lxytstr;
					    if(meetingdata.lxytstr&&meetingdata.lxytstr.length>0){
					        lxytstr = meetingdata.lxytstr;
					    }
					    for(var a=0;a<lxytnum.length;a++){
					        var num = "\t\t"+lxytnum[a];
					        var str = num;
					        
					        if(lxytstr[a]){
					            str += lxytstr[a];
					        }
					        
					        if(a+1<lxytnum.length){
					            str += "\r";
					        }
					        
					        var range = myDocApp.ActiveDocument.Range(start,start+str.length);
					        range.InsertBefore(str);
					        
					        var numrange = myDocApp.ActiveDocument.Range(start,start+num.length);
					        numrange.Bold = true;
					        start += str.length;
					    }
					}
					if(myDocument.Bookmarks.Exists("placeinfo") && meetingdata.place && meetingdata.place.length>0){
					    var start = myDocument.Bookmarks("placeinfo").Range.Start;
					    var place = meetingdata.place;
					    var placestr = meetingdata.placestr;
					    for(var a=0;a<place.length;a++){
					        var str = "";
					        str += "请";
					        if(placestr[a]){
					            str += placestr[a];
					        }
					        str += "在";
					        var pstartnum = start+str.length;
					        var pendnum = pstartnum;
					        if(place[a]){
					            str += place[a];
					            pendnum += place[a].length
					        }
					        str += "参会；";
					        if(a+1<place.length){
					            str += "\r";
					        }
					        var range = myDocApp.ActiveDocument.Range(start,start+str.length);
					        range.InsertBefore(str);
					        range.Bold = false;
					        
					        var numrange = myDocApp.ActiveDocument.Range(pstartnum,pendnum);
					        numrange.Bold = true;
					        start += str.length;
					    }
					}
					if (myDocument.Bookmarks.Exists("zytx") && meetingdata.zytx){
						myDocument.Bookmarks("zytx").Range.InsertBefore(meetingdata.zytx);
					}
					if (myDocument.Bookmarks.Exists("xcbd") && meetingdata.xcbd){
						myDocument.Bookmarks("xcbd").Range.InsertBefore(meetingdata.xcbd);
					}
					if (myDocument.Bookmarks.Exists("lxr") && meetingdata.lxr){
						myDocument.Bookmarks("lxr").Range.InsertBefore(meetingdata.lxr);
					}
					if (myDocument.Bookmarks.Exists("lxdh") && meetingdata.lxdh){
						myDocument.Bookmarks("lxdh").Range.InsertBefore(meetingdata.lxdh);
					}
					if (myDocument.Bookmarks.Exists("bullettime")){
						myDocument.Bookmarks("bullettime").Range.InsertBefore(meetingdata.bullettime);
					}
					if (myDocument.Bookmarks.Exists("year")){
						myDocument.Bookmarks("year").Range.InsertBefore(year);
					}
					if (myDocument.Bookmarks.Exists("month")){
						myDocument.Bookmarks("month").Range.InsertBefore(month);
					}
					if (myDocument.Bookmarks.Exists("day")){
						myDocument.Bookmarks("day").Range.InsertBefore(day);
					}
					if (myDocument.Bookmarks.Exists("hwbzlxr")){
						myDocument.Bookmarks("hwbzlxr").Range.InsertBefore(configparam.hwbzlxr);
					}
					if (myDocument.Bookmarks.Exists("hwbzlxdh")){
						myDocument.Bookmarks("hwbzlxdh").Range.InsertBefore(configparam.hwbzlxdh);
					}
				}
			}
		} catch (e) {
			alert(e.description);
		} finally {
			myDocApp = myDocument = null;
		}
	
}

//参会人员导出龙岗需求
LBCP.DocumentView.HYPZExportWord_CHRY = function(meetingdata,title,domain){
	var url = leapconfig.server + "LEAP/LOAP/LOAPGovHyxt/HYXT/hydcpz/hydcpzchrytemplet.doc";
	if(url.indexof("?")!=-1){
		if(url.indexof("sid=") ==-1){
			url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
	}else{
		url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
	}
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		var param = {docType:LEAP.WPSAddon.docType.wps,
					docId: UUID.randomUUID(),
				    fileTitle: title,
				    fileName: url,
				    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
				    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
				    customAfterOpenFn: "LBCP.DocumentView.afterOpenHYPZDCTemplete_wpsAddon_CHRY", 
				    buttons: "submit,saveAs",
				    customButtons: null,
				    waterMark: null,
				    exparam:{myBookmarks:null,EntityBeans:{meetingdata:meetingdata}},
					notifyFn:null,
					domain:domain
				};
				
		LEAP.WPSAddon.OpenDocument(param);
	}else{
		var _form = domain.loadForm('loapprint', '打印');
	    LEAP.form.maxSize(_form.form);
	    //判断是不是用了iweboffice
	    var afterloadfn = LBCP.DocumentView.afterOpenHYPZDCTemplete_office_CHRY;
	    var par = {
	        url: url,
	        afterload: afterloadfn,
	        buttons: "saveAs,print",
	        exparam:{domain:domain,meetingdata:meetingdata}
	    };
	    LEAP.asyn(_form.module.init, _form.module, 500, par, domain);
	}
}

LBCP.DocumentView.afterOpenHYPZDCTemplete_wpsAddon_CHRY = function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	myDocument.TrackRevisions = false;
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");
	//插入文本
	if (myParam.EntityBeans)
	{
		myParam.EntityBeans.iswps = true;
		LBCP.DocumentView.__afterOpenHYPZDCTemplete_office_CHRY(null, true, myDocument, myDocApp,myParam.EntityBeans);
	}	
	
}

LBCP.DocumentView.afterOpenHYPZDCTemplete_office_CHRY = function(myDocument, activedocument,exparam) {
    return LBCP.DocumentView.__afterOpenHYPZDCTemplete_office_CHRY(null, true, myDocument, activedocument,exparam);
}

LBCP.DocumentView.__afterOpenHYPZDCTemplete_office_CHRY = function(template, dispApp, myDocument, activedocument,exparam) {
		try {
			var myDocApp = null;
			if(exparam.iswps){
				myDocApp = activedocument;
			}else{
				if (myDocument == null) {
					myDocApp = new ActiveXObject("word.Application"); // mydocapp就是这个
					if (dispApp == true)
						myDocApp.Application.Visible = true;
					myDocument = myDocApp.Documents.Open(template);
				} else {
					myDocApp = myDocument.application;
				}
			}
			
			var meetingdata = exparam.meetingdata;
			if(meetingdata){
				var table = null;
				var qjusers = null;
				if(meetingdata.qjusers){
					qjusers = JSON.parse(meetingdata.qjusers);
				}
				if(exparam.iswps || LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
					if (myDocument.Bookmarks.Exists("meetingtime")){
						myDocument.Bookmarks.Item("meetingtime").Range.InsertBefore(meetingdata.meetingtime);
					}
					if (myDocument.Bookmarks.Exists("qcchry")){
						myDocument.Bookmarks.Item("qcchry").Range.InsertBefore(meetingdata.qcchry);
					}
					if (myDocument.Bookmarks.Exists("qclxry")){
						myDocument.Bookmarks.Item("qclxry").Range.InsertBefore(meetingdata.qclxry);
					}
					if (myDocument.Bookmarks.Exists("chrydclxld")){
						myDocument.Bookmarks.Item("chrydclxld").Range.InsertBefore(meetingdata.chrydclxld);
					}
					if (myDocument.Bookmarks.Exists("lxytnum")){
						myDocument.Bookmarks.Item("lxytnum").Range.InsertBefore(meetingdata.lxytnum);
					}
					if (myDocument.Bookmarks.Exists("ytchryinfo")){
						var ytstr = meetingdata.ytstr;
						if(ytstr && ytstr.length>0){
							var start = myDocument.Bookmarks.Item("ytchryinfo").Range.Start;
							for(var a=0;a<ytstr.length;a++){
								var str = "列席第"+(a+1)+"议题：\n";
								
								var pendnum = start+str.length;
								
								str += ytstr[a];
								
								var range = myDocApp.ActiveDocument.Range(start,start+str.length);
								range.InsertBefore(str);
								
								var numrange = myDocApp.ActiveDocument.Range(start,pendnum);
								numrange.Bold = true;
								start += str.length;
							}
						}
					}
					if (myDocument.Bookmarks.Exists("jdytnum")){
						myDocument.Bookmarks.Item("jdytnum").Range.InsertBefore(meetingdata.jdytnum);
					}
					if (myDocument.Bookmarks.Exists("jdytstr")){
						myDocument.Bookmarks.Item("jdytstr").Range.InsertBefore(meetingdata.jdytstr);
					}
					table = myDocument.Tables.Item(1);
				}else{
					if (myDocument.Bookmarks.Exists("meetingtime")){
						myDocument.Bookmarks("meetingtime").Range.InsertBefore(meetingdata.meetingtime);
					}
					if (myDocument.Bookmarks.Exists("qcchry")){
						myDocument.Bookmarks("qcchry").Range.InsertBefore(meetingdata.qcchry);
					}
					if (myDocument.Bookmarks.Exists("qclxry")){
						myDocument.Bookmarks("qclxry").Range.InsertBefore(meetingdata.qclxry);
					}
					if (myDocument.Bookmarks.Exists("chrydclxld")){
						myDocument.Bookmarks("chrydclxld").Range.InsertBefore(meetingdata.chrydclxld);
					}
					if (myDocument.Bookmarks.Exists("lxytnum")){
						myDocument.Bookmarks("lxytnum").Range.InsertBefore(meetingdata.lxytnum);
					}
					if (myDocument.Bookmarks.Exists("ytchryinfo")){
						var ytstr = meetingdata.ytstr;
						if(ytstr && ytstr.length>0){
							var start = myDocument.Bookmarks.Item("ytchryinfo").Range.Start;
							for(var a=0;a<ytstr.length;a++){
								var str = "列席第"+(a+1)+"议题：\n";
								
								var pendnum = start+str.length;
								
								str += ytstr[a];
								
								var range = myDocApp.ActiveDocument.Range(start,start+str.length);
								range.InsertBefore(str);
								
								var numrange = myDocApp.ActiveDocument.Range(start,pendnum);
								numrange.Bold = true;
								start += str.length;
							}
						}
					}
					if (myDocument.Bookmarks.Exists("jdytnum")){
						myDocument.Bookmarks("jdytnum").Range.InsertBefore(meetingdata.jdytnum);
					}
					if (myDocument.Bookmarks.Exists("jdytstr")){
						myDocument.Bookmarks("jdytstr").Range.InsertBefore(meetingdata.jdytstr);
					}
					table = myDocument.Tables(1);
				}
				if(table && qjusers && qjusers.length>0){
					for(var i=0;i<qjusers.length;i++){
						if(i>0){
							table.Rows.Add();
						}
						table.Cell(i+2, 1).Range.InsertAfter(qjusers[i].username);
						table.Cell(i+2, 2).Range.InsertAfter(qjusers[i].userpostname);
						table.Cell(i+2, 3).Range.InsertAfter(qjusers[i].qjyy);
						table.Cell(i+2, 4).Range.InsertAfter(qjusers[i].remarks);
					}
				}
			}
		} catch (e) {
			alert(e.description);
		} finally {
			myDocApp = myDocument = null;
		}
	
}

//会议议程导出龙岗需求
LBCP.DocumentView.HYPZExportWord_HYYC = function(meetingdata,title,domain){
	var url = leapconfig.server + "LEAP/LOAP/LOAPGovHyxt/HYXT/hydcpz/hydcpzhyyctemplet.doc";
	if(url.indexof("?")!=-1){
		if(url.indexof("sid=") ==-1){
			url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
	}else{
		url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
	}
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		var param = {docType:LEAP.WPSAddon.docType.wps,
					docId: UUID.randomUUID(),
				    fileTitle: title,
				    fileName: url,
				    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
				    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
				    customAfterOpenFn: "LBCP.DocumentView.afterOpenHYPZDCTemplete_wpsAddon_HYYC", 
				    buttons: "submit,saveAs",
				    customButtons: null,
				    waterMark: null,
				    exparam:{myBookmarks:null,EntityBeans:{meetingdata:meetingdata}},
					notifyFn:null,
					domain:domain
				};
				
		LEAP.WPSAddon.OpenDocument(param);
	}else{
		var _form = domain.loadForm('loapprint', '打印');
	    LEAP.form.maxSize(_form.form);
	    //判断是不是用了iweboffice
	    var afterloadfn = LBCP.DocumentView.afterOpenHYPZDCTemplete_office_HYYC;
	    var par = {
	        url: url,
	        afterload: afterloadfn,
	        buttons: "saveAs,print",
	        exparam:{domain:domain,meetingdata:meetingdata}
	    };
	    LEAP.asyn(_form.module.init, _form.module, 500, par, domain);
	}
}

LBCP.DocumentView.afterOpenHYPZDCTemplete_wpsAddon_HYYC = function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	myDocument.TrackRevisions = false;
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");
	//插入文本
	if (myParam.EntityBeans)
	{
		myParam.EntityBeans.iswps = true;
		LBCP.DocumentView.__afterOpenHYPZDCTemplete_office_HYYC(null, true, myDocument, myDocApp,myParam.EntityBeans);
	}	
	
}

LBCP.DocumentView.afterOpenHYPZDCTemplete_office_HYYC = function(myDocument, activedocument,exparam) {
    return LBCP.DocumentView.__afterOpenHYPZDCTemplete_office_HYYC(null, true, myDocument, activedocument,exparam);
}

LBCP.DocumentView.__afterOpenHYPZDCTemplete_office_HYYC = function(template, dispApp, myDocument, activedocument,exparam) {
		try {
			var myDocApp = null;
			if(exparam.iswps){
				myDocApp = activedocument;
			}else{
				if (myDocument == null) {
					myDocApp = new ActiveXObject("word.Application"); // mydocapp就是这个
					if (dispApp == true)
						myDocApp.Application.Visible = true;
					myDocument = myDocApp.Documents.Open(template);
				} else {
					myDocApp = myDocument.application;
				}
			}
			
			var meetingdata = exparam.meetingdata;
			if(meetingdata){
				var table = null;
				var topicdata = null;
				if(meetingdata.topicdata){
					topicdata = meetingdata.topicdata;
				}
				if(exparam.iswps || LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
					if (myDocument.Bookmarks.Exists("meetingtitle")){
						myDocument.Bookmarks.Item("meetingtitle").Range.InsertBefore(meetingdata.meetingtitle);
					}
					if (myDocument.Bookmarks.Exists("begintime")){
						myDocument.Bookmarks.Item("begintime").Range.InsertBefore(meetingdata.begintime);
					}
					if (myDocument.Bookmarks.Exists("meetingaddress")){
						myDocument.Bookmarks.Item("meetingaddress").Range.InsertBefore(meetingdata.meetingaddress);
					}
					if (myDocument.Bookmarks.Exists("presider")){
						myDocument.Bookmarks.Item("presider").Range.InsertBefore(meetingdata.presider);
					}
					table = myDocument.Tables.Item(1);
				}else{
					if (myDocument.Bookmarks.Exists("meetingtitle")){
						myDocument.Bookmarks("meetingtitle").Range.InsertBefore(meetingdata.meetingtitle);
					}
					if (myDocument.Bookmarks.Exists("begintime")){
						myDocument.Bookmarks("begintime").Range.InsertBefore(meetingdata.begintime);
					}
					if (myDocument.Bookmarks.Exists("meetingaddress")){
						myDocument.Bookmarks("meetingaddress").Range.InsertBefore(meetingdata.meetingaddress);
					}
					if (myDocument.Bookmarks.Exists("presider")){
						myDocument.Bookmarks("presider").Range.InsertBefore(meetingdata.presider);
					}
					table = myDocument.Tables(1);
				}
				if(table && topicdata && topicdata.length>0){
					for(var i=0;i<topicdata.length;i++){
						if(i>0){
							table.Rows.Add();
						}
						table.Cell(i+2, 1).Range.InsertAfter(i+1);
						table.Cell(i+2, 2).Range.InsertAfter(topicdata[i].topicname);
						table.Cell(i+2, 3).Range.InsertAfter(topicdata[i].topicreporter);
						table.Cell(i+2, 4).Range.InsertAfter(topicdata[i].reportminnum>0?(topicdata[i].reportminnum+"分钟"):"");
						table.Cell(i+2, 5).Range.InsertAfter(topicdata[i].cjrystr);
					}
				}
			}
		} catch (e) {
			alert(e.description);
		} finally {
			myDocApp = myDocument = null;
		}
	
}

//会议纪要导出龙岗需求
LBCP.DocumentView.HYPZExportWord_HYJY = function(meetingdata,title,domain){
	var url = leapconfig.server + "LEAP/LOAP/LOAPGovHyxt/HYXT/hydcpz/hydcpzhyjytemplet.doc";
	if(url.indexof("?")!=-1){
		if(url.indexof("sid=") ==-1){
			url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
	}else{
		url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
	}
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		var param = {docType:LEAP.WPSAddon.docType.wps,
					docId: UUID.randomUUID(),
				    fileTitle: title,
				    fileName: url,
				    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
				    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
				    customAfterOpenFn: "LBCP.DocumentView.afterOpenHYPZDCTemplete_wpsAddon_HYJY", 
				    buttons: "submit,saveAs",
				    customButtons: null,
				    waterMark: null,
				    exparam:{myBookmarks:null,EntityBeans:{meetingdata:meetingdata}},
					notifyFn:null,
					domain:domain
				};
				
		LEAP.WPSAddon.OpenDocument(param);
	}else{
		var _form = domain.loadForm('loapprint', '打印');
	    LEAP.form.maxSize(_form.form);
	    //判断是不是用了iweboffice
	    var afterloadfn = LBCP.DocumentView.afterOpenHYPZDCTemplete_office_HYJY;
	    var par = {
	        url: url,
	        afterload: afterloadfn,
	        buttons: "saveAs,print",
	        exparam:{domain:domain,meetingdata:meetingdata}
	    };
	    LEAP.asyn(_form.module.init, _form.module, 500, par, domain);
	}
}

LBCP.DocumentView.afterOpenHYPZDCTemplete_wpsAddon_HYJY = function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	myDocument.TrackRevisions = false;
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");
	//插入文本
	if (myParam.EntityBeans)
	{
		myParam.EntityBeans.iswps = true;
		LBCP.DocumentView.__afterOpenHYPZDCTemplete_office_HYJY(null, true, myDocument, myDocApp,myParam.EntityBeans);
	}	
	
}

LBCP.DocumentView.afterOpenHYPZDCTemplete_office_HYJY = function(myDocument, activedocument,exparam) {
    return LBCP.DocumentView.__afterOpenHYPZDCTemplete_office_HYJY(null, true, myDocument, activedocument,exparam);
}

LBCP.DocumentView.__afterOpenHYPZDCTemplete_office_HYJY = function(template, dispApp, myDocument, activedocument,exparam) {
		try {
			var myDocApp = null;
			if(exparam.iswps){
				myDocApp = activedocument;
			}else{
				if (myDocument == null) {
					myDocApp = new ActiveXObject("word.Application"); // mydocapp就是这个
					if (dispApp == true)
						myDocApp.Application.Visible = true;
					myDocument = myDocApp.Documents.Open(template);
				} else {
					myDocApp = myDocument.application;
				}
			}
			
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth()+1;
			var day = date.getDate();
			
			var meetingdata = exparam.meetingdata;
			if(meetingdata){
				if(exparam.iswps || LEAP.DocumentView.DocumentEditor_win == "IWebOffice"){
					if (myDocument.Bookmarks.Exists("year")){
						myDocument.Bookmarks.Item("year").Range.InsertBefore(year);
					}
					if (myDocument.Bookmarks.Exists("meetingtime") && meetingdata.meetingtime){
						myDocument.Bookmarks.Item("meetingtime").Range.InsertBefore(meetingdata.meetingtime);
					}
					if (myDocument.Bookmarks.Exists("presider") && meetingdata.presider){
						myDocument.Bookmarks.Item("presider").Range.InsertBefore(meetingdata.presider);
					}
					if (myDocument.Bookmarks.Exists("meetingtitle") && meetingdata.meetingtitle){
						myDocument.Bookmarks.Item("meetingtitle").Range.InsertBefore(meetingdata.meetingtitle);
					}
					if (myDocument.Bookmarks.Exists("topicdata")){
						var ytnum = meetingdata.ytnum;
						var ytstr = meetingdata.ytname;
						if(ytstr && ytstr.length>0 && ytnum && ytnum.length>0){
							var start = myDocument.Bookmarks.Item("topicdata").Range.Start;
							for(var a=0;a<ytstr.length;a++){
								var str = ytnum[a]+"\n";
								
								var pendnum = start+str.length;
								
								str += ytstr[a]+"\n";
								
								var range = myDocApp.ActiveDocument.Range(start,start+str.length);
								range.InsertBefore(str);
								
								var numrange = myDocApp.ActiveDocument.Range(start,pendnum);
								numrange.ParagraphFormat.Alignment = 1;
								var strrange = myDocApp.ActiveDocument.Range(pendnum,pendnum+ytstr[a].length);
								strrange.Font.Name = "仿宋_GB2312";
								start += str.length;
							}
						}
					}
					if (myDocument.Bookmarks.Exists("presider2") && meetingdata.presider){
						var start = myDocument.Bookmarks.Item("presider2").Range.Start;
						var str = meetingdata.presider+"。";
						var pendnum = start+str.length;
						myDocument.Bookmarks.Item("presider2").Range.InsertBefore(str);
						var strrange = myDocApp.ActiveDocument.Range(start,pendnum);
						strrange.Font.Name = "仿宋_GB2312";
					}
					if (myDocument.Bookmarks.Exists("qcchry") && meetingdata.qcchry){
						var start = myDocument.Bookmarks.Item("qcchry").Range.Start;
						var pendnum = start+meetingdata.qcchry.length;
						myDocument.Bookmarks.Item("qcchry").Range.InsertBefore(meetingdata.qcchry);
						var strrange = myDocApp.ActiveDocument.Range(start,pendnum);
						strrange.Font.Name = "仿宋_GB2312";
					}
					if (myDocument.Bookmarks.Exists("qjry") && meetingdata.qjry){
						var start = myDocument.Bookmarks.Item("qjry").Range.Start;
						var pendnum = start+meetingdata.qjry.length;
						myDocument.Bookmarks.Item("qjry").Range.InsertBefore(meetingdata.qjry);
						var strrange = myDocApp.ActiveDocument.Range(start,pendnum);
						strrange.Font.Name = "仿宋_GB2312";
					}
					if (myDocument.Bookmarks.Exists("gdlxry") && meetingdata.gdlxry){
						var start = myDocument.Bookmarks.Item("gdlxry").Range.Start;
						var pendnum = start+meetingdata.gdlxry.length;
						myDocument.Bookmarks.Item("gdlxry").Range.InsertBefore(meetingdata.gdlxry);
						var strrange = myDocApp.ActiveDocument.Range(start,pendnum);
						strrange.Font.Name = "仿宋_GB2312";
					}
					if (myDocument.Bookmarks.Exists("cyrydata")){
						var ytnum = meetingdata.ytnum;
						var ytstr = meetingdata.ytbmry;
						if(ytstr && ytstr.length>0 && ytnum && ytnum.length>0){
							var start = myDocument.Bookmarks.Item("cyrydata").Range.Start;
							for(var a=0;a<ytstr.length;a++){
								var str = "列席第"+ytnum[a]+"议题：";
								
								var pendnum = start+str.length;
								
								str += ytstr[a]+"\n";
								
								var range = myDocApp.ActiveDocument.Range(start,start+str.length);
								range.InsertBefore(str);
								
								var strrange = myDocApp.ActiveDocument.Range(pendnum,pendnum+ytstr[a].length);
								strrange.Font.Name = "仿宋_GB2312";
								start += str.length;
							}
						}
					}
					if (myDocument.Bookmarks.Exists("cydw") && meetingdata.cydw){
						myDocument.Bookmarks.Item("cydw").Range.InsertBefore(meetingdata.cydw);
					}
					if (myDocument.Bookmarks.Exists("year2")){
						myDocument.Bookmarks.Item("year2").Range.InsertBefore(year);
					}
					if (myDocument.Bookmarks.Exists("month")){
						myDocument.Bookmarks.Item("month").Range.InsertBefore(month);
					}
					if (myDocument.Bookmarks.Exists("day")){
						myDocument.Bookmarks.Item("day").Range.InsertBefore(day);
					}
				}else{
					if (myDocument.Bookmarks.Exists("year")){
						myDocument.Bookmarks("year").Range.InsertBefore(year);
					}
					if (myDocument.Bookmarks.Exists("meetingtime") && meetingdata.meetingtime){
						myDocument.Bookmarks("meetingtime").Range.InsertBefore(meetingdata.meetingtime);
					}
					if (myDocument.Bookmarks.Exists("presider") && meetingdata.presider){
						myDocument.Bookmarks("presider").Range.InsertBefore(meetingdata.presider?meetingdata.presider:"");
					}
					if (myDocument.Bookmarks.Exists("meetingtitle") && meetingdata.meetingtitle){
						myDocument.Bookmarks("meetingtitle").Range.InsertBefore(meetingdata.meetingtitle);
					}
					if (myDocument.Bookmarks.Exists("topicdata")){
						var ytnum = meetingdata.ytnum;
						var ytstr = meetingdata.ytname;
						if(ytstr && ytstr.length>0 && ytnum && ytnum.length>0){
							var start = myDocument.Bookmarks("topicdata").Range.Start;
							for(var a=0;a<ytstr.length;a++){
								var str = ytnum[a]+"\n";
								
								var pendnum = start+str.length;
								
								str += ytstr[a]+"\n";
								
								var range = myDocApp.ActiveDocument.Range(start,start+str.length);
								range.InsertBefore(str);
								
								var numrange = myDocApp.ActiveDocument.Range(start,pendnum);
								numrange.ParagraphFormat.Alignment = 1;
								var strrange = myDocApp.ActiveDocument.Range(pendnum,pendnum+ytstr[a].length);
								strrange.Font.Name = "仿宋_GB2312";
								start += str.length;
							}
						}
					}
					if (myDocument.Bookmarks.Exists("presider2") && meetingdata.presider){
						var start = myDocument.Bookmarks("presider2").Range.Start;
						var str = meetingdata.presider+"。";
						var pendnum = start+str.length;
						myDocument.Bookmarks("presider2").Range.InsertBefore(str);
						var strrange = myDocApp.ActiveDocument.Range(start,pendnum);
						strrange.Font.Name = "仿宋_GB2312";
					}
					if (myDocument.Bookmarks.Exists("qcchry") && meetingdata.qcchry){
						var start = myDocument.Bookmarks("qcchry").Range.Start;
						var pendnum = start+meetingdata.qcchry.length;
						myDocument.Bookmarks("qcchry").Range.InsertBefore(meetingdata.qcchry);
						var strrange = myDocApp.ActiveDocument.Range(start,pendnum);
						strrange.Font.Name = "仿宋_GB2312";
					}
					if (myDocument.Bookmarks.Exists("qjry") && meetingdata.qjry){
						var start = myDocument.Bookmarks("qjry").Range.Start;
						var pendnum = start+meetingdata.qjry.length;
						myDocument.Bookmarks("qjry").Range.InsertBefore(meetingdata.qjry);
						var strrange = myDocApp.ActiveDocument.Range(start,pendnum);
						strrange.Font.Name = "仿宋_GB2312";
					}
					if (myDocument.Bookmarks.Exists("gdlxry") && meetingdata.gdlxry){
						var start = myDocument.Bookmarks("gdlxry").Range.Start;
						var pendnum = start+meetingdata.gdlxry.length;
						myDocument.Bookmarks("gdlxry").Range.InsertBefore(meetingdata.gdlxry);
						var strrange = myDocApp.ActiveDocument.Range(start,pendnum);
						strrange.Font.Name = "仿宋_GB2312";
					}
					if (myDocument.Bookmarks.Exists("cyrydata")){
						var ytnum = meetingdata.ytnum;
						var ytstr = meetingdata.ytbmry;
						if(ytstr && ytstr.length>0 && ytnum && ytnum.length>0){
							var start = myDocument.Bookmarks("cyrydata").Range.Start;
							for(var a=0;a<ytstr.length;a++){
								var str = "列席第"+ytnum[a]+"议题：";
								
								var pendnum = start+str.length;
								
								str += ytstr[a]+"\n";
								
								var range = myDocApp.ActiveDocument.Range(start,start+str.length);
								range.InsertBefore(str);
								
								var strrange = myDocApp.ActiveDocument.Range(pendnum,pendnum+ytstr[a].length);
								strrange.Font.Name = "仿宋_GB2312";
								start += str.length;
							}
						}
					}
					if (myDocument.Bookmarks.Exists("cydw") && meetingdata.cydw){
						myDocument.Bookmarks("cydw").Range.InsertBefore(meetingdata.cydw);
					}
					if (myDocument.Bookmarks.Exists("year2")){
						myDocument.Bookmarks("year2").Range.InsertBefore(year);
					}
					if (myDocument.Bookmarks.Exists("month")){
						myDocument.Bookmarks("month").Range.InsertBefore(month);
					}
					if (myDocument.Bookmarks.Exists("day")){
						myDocument.Bookmarks("day").Range.InsertBefore(day);
					}
				}
			}
		} catch (e) {
			alert(e.description);
		} finally {
			myDocApp = myDocument = null;
		}
	
}

//铭牌打印
LBCP.DocumentView.printNameCard2 = function(domain,url,printdata){
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		if(url.indexof("?")!=-1){
			if(url.indexof("sid=") ==-1){
				url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
			}
		}else{
			url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
		var param = {docType:LEAP.WPSAddon.docType.wps,
			docId: UUID.randomUUID(),
		    fileTitle: "铭牌打印",
		    fileName: url,
		    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
		    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
		    customAfterOpenFn: "LBCP.DocumentView.afterOpenPrintNameCard_wpsAddon", 
		    //hideDefaultButtons:true,
		    buttons: "submit,saveAs",
		    customButtons: null,
		    waterMark: leapconfig.server + LEAP.getWaterMark(),
		    exparam:{myBookmarks:null,EntityBeans:{printdata:printdata}},
			notifyFn:null,
			domain:domain
		};
		LEAP.WPSAddon.OpenDocument(param);
	}else{
		var _form = domain.loadForm('loapprint', '打印');
	    LEAP.form.maxSize(_form.form);
	    //判断是不是用了iweboffice
	    var afterloadfn = LBCP.DocumentView.afterOpenPrintNameCard_office;
	    var par = {
	        url: url,
	        afterload: afterloadfn,
	        buttons: "saveAs,print",
	        exparam:{domain:domain,printdata:printdata}
	    };
	    LEAP.asyn(_form.module.init, _form.module, 500, par, domain);
	}
}

LBCP.DocumentView.afterOpenPrintNameCard_wpsAddon = function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	myDocument.TrackRevisions = false;
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");
	//插入文本
	if (myParam.EntityBeans)
	{
		myParam.EntityBeans.iswps = true;
		LBCP.DocumentView.__afterOpenPrintNameCard_office(null, true, myDocument, myDocApp,myParam.EntityBeans);
	}	
	
}

LBCP.DocumentView.afterOpenPrintNameCard_office = function(myDocument, activedocument,exparam) {
    return LBCP.DocumentView.__afterOpenPrintNameCard_office(null, true, myDocument, activedocument,exparam);
}

LBCP.DocumentView.__afterOpenPrintNameCard_office = function(template, dispApp, myDocument, activedocument,exparam) {
		try {
			var myDocApp = null;
			if(exparam.iswps){
				myDocApp = activedocument;
			}else{
				if (myDocument == null) {
					myDocApp = new ActiveXObject("word.Application"); // mydocapp就是这个
					if (dispApp == true)
						myDocApp.Application.Visible = true;
					myDocument = myDocApp.Documents.Open(template);
				} else {
					myDocApp = myDocument.application;
				}
			}
			
			var printdata = exparam.printdata;
			var leaderNames = printdata.leaderNames;
			var printSize = printdata.printSize;
			var printFont = printdata.printFont;
			var fillfont = printdata.fillfont;
			
			var wdCharacter=1;
			var wdOrientLandscape = 1;
			var Selection = myDocApp.Selection;
			
			var size = 0;
			var left=0;
			var top1=0;
			var top2=0;
			var font="华文行楷";
			for(i=0;i<leaderNames.length-1;i++){
				var name = leaderNames[i].trim();
				if(name=="")continue;
				if(name.length==2)name=name.substring(0,1)+"　"+name.substring(1);
				if(printSize==1){
					size=160;
					left=60;
					top1=30;
					top2=300;
				}else if(printSize==2){
					size=155;
					left=65;
					top1=35;
					top2=295;
				}else if(printSize==3){
					size=145;
					left=75;
					top1=40;
					top2=290;
				}else{
					size = Number(printSize);
					left = 220-size;
					top1 = 190-size;
					top2 = size+140;
				}
				/*if(name.indexOf("湧")>-1){
					font="华文中宋";
				}else
					font="华文行楷";*/
				if(name.indexOf("湧")>-1){
					font="华文中宋";
				}else{
					if(printFont==1){//市
						font="方正小标宋 GBK";
					}else if(printFont==2){//区
						font="华文行楷";
					}else{
						font = printFont;
					}
				}
				Selection.InsertRowsBelow(1);
				//var myBox = myDocument.Shapes.AddTextEffect(0,"赵钱孙",font,size,0,0,left,top1);
				if(printFont==1){//市
					var myBox = myDocument.Shapes.AddTextEffect(0,"赵钱孙",font,size,1,0,left,top1);
				}else{//区
					var myBox = myDocument.Shapes.AddTextEffect(0,"赵钱孙",font,size,0,0,left,top1);
				}
				myBox.Fill.Visible = -1;
			    myBox.Rotation = 180;
				myBox.TextEffect.Text = name;
				if(fillfont){
					myBox.Fill.ForeColor.RGB = 0;
				}
				
				
				//var myBoxA = myDocument.Shapes.AddTextEffect(0,"赵钱孙",font,size,0,0,left,top2);
				if(printFont==1){//市
					var myBoxA = myDocument.Shapes.AddTextEffect(0,"赵钱孙",font,size,1,0,left,top2);
				}else{//区
					var myBoxA = myDocument.Shapes.AddTextEffect(0,"赵钱孙",font,size,0,0,left,top2);
				}
				myBoxA.Fill.Visible = -1;
				myBoxA.TextEffect.Text = name;
				if(fillfont){
					myBoxA.Fill.ForeColor.RGB = 0;
				}
				
				Selection.InsertRowsBelow(1);
				
			}
		} catch (e) {
			alert(e.description);
		} finally {
			myDocApp = myDocument = null;
		}
	
}

LBCP.DocumentView.__afterOpenPrintWorkCard_office = function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");	
	//插入文本
	if (myParam.EntityBeans)
	{
    try {
    	
    	process.SetDocParamsValue(myDocument, PARAM_Enum.ignoreBeforeSave, true); 

    	var exparam = myParam.EntityBeans;
        var imgtype = null; //二维码图片格式
       // debugger
        var json = exparam.printdata;

        for (var key in json) {
            if (myDocument.Bookmarks.Exists(key)) {
            	 myDocument.Bookmarks.Item(key).Range.InsertBefore(json[key]);           
            }
        }
      }catch(e){
    	  
      }
    }
}

LBCP.DocumentView._afterOpenCreateDevice = function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");	
	//插入文本
	if (myParam.EntityBeans)
	{
    try {
    	process.SetDocParamsValue(myDocument, PARAM_Enum.ignoreBeforeSave, true); 
    	var exparam = myParam.EntityBeans;
        var json = exparam.printdata;
        for (var key in json) {
            if (myDocument.Bookmarks.Exists(key)) {
            	 myDocument.Bookmarks.Item(key).Range.InsertBefore(json[key]);           
            }
        }
        var table = myDocument.Tables.Item(1);
		if (json.deviceData) {
		
			var length = json.deviceData !=undefined?json.deviceData.length:0;
			if(length>1){
				var p = 2;
				table.Rows.Item(p).Select();
				myDocApp.Selection.InsertRowsBelow(length-1);
				for(var i= 0;i<length;i++){
					var result = json.deviceData[i];
					table.Cell(1+i+1,1).Range.InsertBefore(i+1);
					table.Cell(1+i+1,2).Range.InsertBefore(result["devicename"]);
					table.Cell(1+i+1,3).Range.InsertBefore(result["model"]);
					table.Cell(1+i+1,4).Range.InsertBefore(result["amount"]);
					table.Cell(1+i+1,5).Range.InsertBefore(result["remarks"]);
				}
			}else if(length =1){
				for(var i= 0;i<length;i++){
					var result = json.deviceData[i];
					table.Cell(1+i+1,1).Range.InsertBefore(i+1);
					table.Cell(1+i+1,2).Range.InsertBefore(result["devicename"]);
					table.Cell(1+i+1,3).Range.InsertBefore(result["model"]);
					table.Cell(1+i+1,4).Range.InsertBefore(result["amount"]);
					table.Cell(1+i+1,5).Range.InsertBefore(result["remarks"]);
				}
			}
		}
      }catch (e) {
			alert(e.description);
		} finally {
			myDocApp = myDocument = null;
		}
    }
}


/*********************************************************************************/


/******************************宝安铭牌打印***************************************************/

LBCP.DocumentView.printNameCard3 = function(domain,url,printdata){
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		var fileTitle = "銘牌打印";
		var waterMark = leapconfig.server + LEAP.getWaterMark();
		if (printdata && printdata.fileTitle) {
			waterMark = null;
			fileTitle = printdata.fileTitle;
		}
		if(url.indexof("?")!=-1){
			if(url.indexof("sid=") ==-1){
				url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
			}
		}else{
			url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
		var param = {docType:LEAP.WPSAddon.docType.wps,
			docId: UUID.randomUUID(),
		    fileTitle: fileTitle,
		    fileName: url,
		    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
		    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
		    customAfterOpenFn: "LBCP.DocumentView.afterOpenPrintNameCard_wpsAddon_baoa", 
		    //hideDefaultButtons:true,
		    buttons: "submit,saveAs",
		    customButtons: null,
//		    waterMark: leapconfig.server + LEAP.getWaterMark(),
		    waterMark: waterMark,
		    exparam:{myBookmarks:null,EntityBeans:{printdata:printdata}},
			notifyFn:null,
			domain:domain
		};
		LEAP.WPSAddon.OpenDocument(param);
	}else{
		var _form = domain.loadForm('loapprint', '打印');
	    LEAP.form.maxSize(_form.form);
	    //判断是不是用了iweboffice
	    var afterloadfn = LBCP.DocumentView.afterOpenPrintNameCard_office;
	    var par = {
	        url: url,
	        afterload: afterloadfn,
	        buttons: "saveAs,print",
	        exparam:{domain:domain,printdata:printdata}
	    };
	    LEAP.asyn(_form.module.init, _form.module, 500, par, domain);
	}
}

LBCP.DocumentView.afterOpenPrintNameCard_wpsAddon_baoa = function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	myDocument.TrackRevisions = false;
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");
	//插入文本
	if (myParam.EntityBeans)
	{
		myParam.EntityBeans.iswps = true;
		LBCP.DocumentView.__afterOpenPrintNameCard_office_baoa(null, true, myDocument, myDocApp,myParam.EntityBeans);
	}	
	
}

LBCP.DocumentView.afterOpenPrintNameCard_office_baoa = function(myDocument, activedocument,exparam) {
    return LBCP.DocumentView.__afterOpenPrintNameCard_office_baoa(null, true, myDocument, activedocument,exparam);
}

LBCP.DocumentView.__afterOpenPrintNameCard_office_baoa = function(template, dispApp, myDocument, activedocument,exparam) {
		try {
			var myDocApp = null;
			if(exparam.iswps){
				myDocApp = activedocument;
			}else{
				if (myDocument == null) {
					myDocApp = new ActiveXObject("word.Application"); // mydocapp就是这个
					if (dispApp == true)
						myDocApp.Application.Visible = true;
					myDocument = myDocApp.Documents.Open(template);
				} else {
					myDocApp = myDocument.application;
				}
			}
			
			var printdata = exparam.printdata;
			var leaderNames = printdata.leaderNames;
			var printSize = printdata.printSize;
			var printFont = printdata.printFont;
			var fillfont = printdata.fillfont;
			var shText = printdata.shText;
			
			var wdCharacter=1;
			var wdOrientLandscape = 1;
			var Selection = myDocApp.Selection;
			
			var size = 0;
			var left=0;
			var top1=0;
			var top2=0;
			var font="华文行楷";
			var Height=null;
			var Width=null;
			
			var isSh=false; //是否双行
			var shSize=0;
			var shLeft=0;
			var shTop1=0;
			var shTop2=0;
			debugger
			for(i=0;i<leaderNames.length;i++){
				
				var name = leaderNames[i].trim();
				
				if(printSize==996){
					size=142;
					left=60;
					top1=75;
					top2=500;
					isSh=true;
//					shSize=36;
					shSize=102;
					shLeft=110;
					shTop1=245;
					shTop2=425;
					Height = 132.7;
					Width=414.7;
				}else if(printSize==997){
//					size=96;
//					left=145;
					size=142;
					left=60;
					top1=75;
					top2=490;
					Height=156;
					Width=415.5;
				}else if(printSize==998){
//					size=96;
//					left=115;
					size=132;
					left=60;
					top1=35;
					top2=355;
					isSh = true;
//					shSize=36;
					shSize=105;
					shLeft=100;
					shTop1=185;
					shTop2=288;
					Height = 132.7;
					Width=414.7;
				}else if(printSize==999){
					size=132;
					left=60;
					top1=55;
					top2=315;
					Height=156;
					Width=415.5;
				}else{
					size = Number(printSize);
					left = 220-size;
					top1 = 190-size;
					top2 = size+140;
				}
				//var myBox = myDocument.Shapes.AddTextEffect(0,"赵钱孙",font,size,0,0,left,top1);
				if(printSize==995){
					if (i < leaderNames.length) {
						Selection.InsertRowsBelow(1);
					}
					var zwps = name.split(",");
					
					if (zwps && zwps.length>0) {
						var myBox1 = myDocument.Shapes.AddTextEffect(0,"赵钱孙",printFont,134,0,0,15,55);
						myBox1.Height = 130;
						myBox1.TextEffect.FontSize = 96;
						myBox1.Fill.Visible = -1;
						myBox1.TextEffect.Text = zwps[0];
						if(fillfont){
							myBox1.Fill.ForeColor.RGB = 0;
						}
						if (zwps[1]) {
							var myBox2 = myDocument.Shapes.AddTextEffect(0,"赵钱孙",printFont,134,0,0,15,285);
							myBox2.Height = 130;
							myBox2.TextEffect.FontSize = 96;
							myBox2.Fill.Visible = -1;
							myBox2.TextEffect.Text = zwps[1];
							if(fillfont){
								myBox2.Fill.ForeColor.RGB = 0;
							}
						}
						if (zwps[2]) {
							var myBox3 = myDocument.Shapes.AddTextEffect(0,"赵钱孙",printFont,134,0,0,15,665);
							myBox3.Height = 130;
							myBox3.TextEffect.FontSize = 96;
							myBox3.Fill.Visible = -1;
							myBox3.TextEffect.Text = zwps[2];
							if(fillfont){
								myBox3.Fill.ForeColor.RGB = 0;
							}
						}
					}
					if (i < (leaderNames.length-2)) {
						Selection.InsertRowsBelow(1);
					}
				}else{
					
					if (leaderNames.length == 1 && (printSize =="999" || printSize =="998")) {
						
					}else{
						Selection.InsertRowsBelow(1);
					}
					var myBox = myDocument.Shapes.AddTextEffect(0,"赵钱孙",printFont,size,0,0,left,top1);
					if (Height!=null) {
						myBox.Height = Height;
					}
					if (Width!=null) {
						myBox.Width=Width;
					}
					if (printSize != 996 ) {
						myBox.TextEffect.FontSize = 96;
					}else{
						myBox.TextEffect.FontSize = 80;
					}
					if (isSh) {
						var myBox1 = myDocument.Shapes.AddTextEffect(0,"赵钱孙","华文楷体",shSize,0,0,shLeft,shTop1);
						myBox1.Fill.Visible = -1;
					    myBox1.Rotation = 180;
					    myBox1.TextEffect.Text = shText;
					    myBox1.Height = 50;
					    myBox1.TextEffect.FontSize = 36;
						if(fillfont){
							myBox1.Fill.ForeColor.RGB = 0;
						}
					}
					myBox.Fill.Visible = -1;
				    myBox.Rotation = 180;
					myBox.TextEffect.Text = name;
					if(fillfont){
						myBox.Fill.ForeColor.RGB = 0;
					}
					
					
					var myBoxA = myDocument.Shapes.AddTextEffect(0,"赵钱孙",printFont,size,0,0,left,top2);
					if (Height!=null) {
						myBoxA.Height = Height;
					}
					if (Width!=null) {
						myBoxA.Width=Width;
					}
					if (printSize != 996 ) {
						myBoxA.TextEffect.FontSize = 96;
					}else{
						myBoxA.TextEffect.FontSize = 80;
					}
					if (isSh) {
						var myBoxA1 = myDocument.Shapes.AddTextEffect(0,"赵钱孙","华文楷体",shSize,0,0,shLeft,shTop2);
						myBoxA1.Fill.Visible = -1;
						myBoxA1.TextEffect.Text = shText;
						myBoxA1.Height = 50;
						myBoxA1.TextEffect.FontSize = 36;
						if(fillfont){
							myBoxA1.Fill.ForeColor.RGB = 0;
						}
					}
					myBoxA.Fill.Visible = -1;
					myBoxA.TextEffect.Text = name;
					if(fillfont){
						myBoxA.Fill.ForeColor.RGB = 0;
					}
					
					if (i<leaderNames.length-2) {
						Selection.InsertRowsBelow(1);
					}
				}
			}
		} catch (e) {
			alert(e.description);
		} finally {
			myDocApp = myDocument = null;
		}
	
}

/*********************************************************************************/


/******************************会议排座门票打印***************************************************/

LBCP.DocumentView.HYXTPrintTicket = function(domain,url,printdata,postselect,printText){
	if((LEAP.DocumentView.isWin && LEAP.DocumentView.DocumentEditor_win == "wpsAddon") || (!LEAP.DocumentView.isWin &&LEAP.DocumentView.DocumentEditor_linux == "wpsAddon")){
		if(url.indexof("?")!=-1){
			if(url.indexof("sid=") ==-1){
				url += "&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
			}
		}else{
			url += "?sid=" + leapclient.getsid() + LEAP.wfrouter.getLid();
		}
		var param = {docType:LEAP.WPSAddon.docType.wps,
			docId: UUID.randomUUID(),
		    fileTitle: "打印会场票",
		    fileName: url,
		    uploadPath: leapconfig.server +"LEAP/Service/RPC/RPC.DO?type=3&rt=o&sid=" + leapclient.getsid() + LEAP.wfrouter.getLid() + "&path=default" + "&LSYS-AREA=" + window._leap_systemarea + "&LSYS-NAME=" + window._leap_systemname,
		    customJs: leapconfig.server +"LEAP/LOAP/Plugin/javascript/loapDocumentView.js", //leapclient.getServerURL(this.leapclient.router) + "LEAP/WPS/testcase/myCustomJs.js",
		    customAfterOpenFn: "LBCP.DocumentView.afterOpenPrintTicket_wpsAddon", 
		    //hideDefaultButtons:true,
		    buttons: "submit,saveAs",
		    customButtons: null,
		    waterMark: leapconfig.server + LEAP.getWaterMark(),
		    exparam:{myBookmarks:null,EntityBeans:{printdata:printdata,postselect:postselect,printText:printText}},
			notifyFn:null,
			domain:domain
		};
		LEAP.WPSAddon.OpenDocument(param);
	}else{
		var _form = domain.loadForm('loapprint', '打印会场票');
	    LEAP.form.maxSize(_form.form);
	    //判断是不是用了iweboffice
	    var afterloadfn = LBCP.DocumentView.afterOpenPrintTicket_office;
	    var par = {
	        url: url,
	        afterload: afterloadfn,
	        buttons: "saveAs,print",
	        exparam:{domain:domain,printdata:printdata,postselect:postselect,printText:printText}
	    };
	    LEAP.asyn(_form.module.init, _form.module, 500, par, domain);
	}
}

LBCP.DocumentView.afterOpenPrintTicket_wpsAddon = function(){
	var myDocument = wps.WpsApplication().ActiveDocument;
	var myDocApp = myDocument.Application;
	
	myDocument.TrackRevisions = false;
	//获取OA端打开模板文件时传入的参数
	var myParam = process.GetActiveDocParamsValue("exparam");
	//插入文本
	if (myParam.EntityBeans)
	{
		myParam.EntityBeans.iswps = true;
		LBCP.DocumentView.__afterOpenPrintTicket_office(null, true, myDocument, myDocApp,myParam.EntityBeans);
	}	
	
}

LBCP.DocumentView.afterOpenPrintTicket_office = function(myDocument, activedocument,exparam) {
    return LBCP.DocumentView.__afterOpenPrintTicket_office(null, true, myDocument, activedocument,exparam);
}

LBCP.DocumentView.__afterOpenPrintTicket_office = function(template, dispApp, myDocument, activedocument,exparam) {
		try {
			var myDocApp = null;
			if(exparam.iswps){
				myDocApp = activedocument;
			}else{
				if (myDocument == null) {
					myDocApp = new ActiveXObject("word.Application"); // mydocapp就是这个
					if (dispApp == true)
						myDocApp.Application.Visible = true;
					myDocument = myDocApp.Documents.Open(template);
				} else {
					myDocApp = myDocument.application;
				}
			}

			var printdata = exparam.printdata;
			var postselect = exparam.postselect;
			var printText = exparam.printText;
			var tablesObj = myDocument.Tables.Item(1);
			var Selection = myDocApp.ActiveWindow.Selection;
			if(printdata) {
				var topValue = 0;
				var temp = 0;
				for ( var i = 0; i < printdata.length; i++) {
					var rowDatas = printdata[i].data;
					Selection.MoveRight(12);
					Selection.TypeParagraph();//回车
					Selection.Font.Name = "华文行楷"
					Selection.Font.Size = 24;
					if(printText != null && printText!= "") {
						Selection.TypeText(rowDatas.name + "              " + printText);//姓名 + 内容
					} else {
						Selection.TypeText(rowDatas.name);//姓名
					}
					
					if((i+1)%4 == 1){
						topValue = 125;
					}
					if((i+1)%4 == 2) {
						topValue = 305;
					}
					if((i+1)%4 == 3) {
						topValue = 485;
					}
					if((i+1)%4 == 0) {
						topValue = 665;
					}
					
					// 职位
					if(postselect&&rowDatas.userpostname)
					{
						var myBox2 = myDocument.Shapes.AddTextbox(1, 117, topValue, 350, 50);
						// 设置无填充，透明
					    myBox2.Fill.Visible = 0;
						// 设置无边框
					    myBox2.Line.Visible = 0;
					    // 选中文本框
					    myBox2.Select();
					    Selection.Font.Name = "华文行楷"
					    Selection.Font.Size = 14;
					    Selection.Font.SizeBi = 10;
					    Selection.TypeText(rowDatas.userpostname);
					    // 格式
			    		Selection.ParagraphFormat.SpaceBefore = 0;
			    		Selection.ParagraphFormat.SpaceBeforeAuto = false;
			    		Selection.ParagraphFormat.SpaceAfter = 0;
			    		Selection.ParagraphFormat.SpaceAfterAuto = false;
			    		Selection.ParagraphFormat.LineSpacingRule = 4;
			    		Selection.ParagraphFormat.LineSpacing = 15;
			    		Selection.ParagraphFormat.Alignment = 3;
			    		Selection.ParagraphFormat.WidowControl = false;
			    		Selection.ParagraphFormat.KeepWithNext = false;
			    		Selection.ParagraphFormat.KeepTogether = false;
			    		Selection.ParagraphFormat.PageBreakBefore = false;
			    		Selection.ParagraphFormat.NoLineNumber = false;
			    		Selection.ParagraphFormat.Hyphenation = true;
					}
					
					if(rowDatas.seat && rowDatas.seat.split(",").length>0){
						var seatrow = rowDatas.seat.split(",")[0];
						var seatcol = rowDatas.seat.split(",")[1];
						// 座位号
						var myBox1 = myDocument.Shapes.AddTextbox(1, 350, (topValue+25), 120, 30);
						// 设置无填充，透明
						myBox1.Fill.Visible = 0;
						// 设置无边框
						myBox1.Line.Visible = 0;
						// 选中文本框
						myBox1.Select();
						Selection.Font.Name = "华文行楷"
						Selection.Font.Size = 20;
						Selection.Font.SizeBi = 10;
						Selection.TypeText(seatrow+"排 "+seatcol+"列");
						// 格式
						Selection.ParagraphFormat.SpaceBefore = 0;
						Selection.ParagraphFormat.SpaceBeforeAuto = false;
						Selection.ParagraphFormat.SpaceAfter = 0;
						Selection.ParagraphFormat.SpaceAfterAuto = false;
						Selection.ParagraphFormat.LineSpacingRule = 4;
						Selection.ParagraphFormat.LineSpacing = 18;
						Selection.ParagraphFormat.Alignment = 3;
						Selection.ParagraphFormat.WidowControl = false;
						Selection.ParagraphFormat.KeepWithNext = false;
						Selection.ParagraphFormat.KeepTogether = false;
						Selection.ParagraphFormat.PageBreakBefore = false;
						Selection.ParagraphFormat.NoLineNumber = false;
						Selection.ParagraphFormat.Hyphenation = true;
					}
					
					tablesObj.Cell(i+1, 2).Select();// 选中当前单元格
					if(i != printdata.length-1)
					{
						Selection.MoveRight(12);
					}
				}
			}
		} catch (e) {
			alert(e.description);
		} finally {
			myDocApp = myDocument = null;
		}
	
}

/*********************************************************************************/