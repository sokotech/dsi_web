var projects;
var authors;

var vars=getUrlVars();
var lng="es";
//if(vars["lng"]) lng=vars["lng"];

function getUrlVars() 
{
	var vars = {};
	var parts = window.location.href.replace(/[?&#]+([^=&#]+)=([^&#]*)/gi, function(m,key,value) 
	{
		vars[key] = value;
	});
	return(vars);
}


var includes_loaded=false;
var page_loaded=false;

function loadHTML(items, i)
{
	fetch($(items[i]).attr("include-HTML")+"?"+new Date().getTime())
		.then(function(response) {
   				 return response.text();
		}).then(function(text) {
    			$(items[i]).html(text);
				i++;
				if(i<items.length)
					loadHTML(items,i);
				else{
					includes_loaded=true;
					if(page_loaded) loadDone();
				}
		});
}

function includeHTML()
{
  var imports=$("[include-HTML]");
  if(imports.length>0) loadHTML(imports,0); 
}

function email_isvalid(email)
{
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;
  return(regex.test(email));
}

function show_project_info(prj)
{
	document.title=projects[prj].title;
	$(".project_title").text(projects[prj].title);
	$(".project_video iframe").attr("src","https://player.vimeo.com/video/"+projects[prj].video+
											  "?title=0&byline=0&portrait=0");
	if(projects[prj].dossier)
		$(".project_dossier").attr("href","data/projects/dossiers/"+projects[prj].dossier);
	else{ 
		$(".project_dossier").addClass("disabled");		
		$(".project_dossier").text("Dossier descargable próximamente"); //hide();
	}	
	$(".project_description").text(projects[prj].description);
   /*fetch("data/projects/info/"+projects[prj].info)
     .then(function(response){
			 return response.text().then(function(text){
			 		$(".project_description").html(text); 
		    });
     })
     .catch(function(error){ 
   	console.log(error); 
     });   
   */									     
	$(".author_name").text(authors[projects[prj].author].name);
	$(".author_bio").html(authors[projects[prj].author].bio);
	
	$(".author_picture").attr("src","data/authors/pictures/"+authors[projects[prj].author].picture);
}

function span_lng(e,text,lang)
{
	e.html(e.html()+"<span class='lng lng_"+lang+"'>"+text+"</span>");
}
function show_projects(grid,func)
{
	var lngs=new Array("es","ca","en");
	
	$(grid).html("");

   var preload=Object.keys(projects).length;
   
	for(var key in projects) 
	{
		var prj=$("#dummy .project_item").clone();
		
		for(a=0;a<lngs.length;a++)
		{	
			span_lng(prj.find(".project_data_title"),projects[key]["title_"+lngs[a]],lngs[a]);
			span_lng(prj.find(".project_data_date"),projects[key]["date_"+lngs[a]],lngs[a]);
			span_lng(prj.find(".project_data_place"),projects[key]["place_"+lngs[a]],lngs[a]);
			span_lng(prj.find(".project_data_info"),projects[key]["description_"+lngs[a]],lngs[a]);
		}
		if(projects[key].class)
			prj.find(".project_data_border").addClass(projects[key].class);
		prj.find(".project_link").attr("data-project",key);
		prj.find(".project_link").attr("href","project.html?id="+key);	

		prj.find("img")[0].onload=function()
		{
			preload--;
			if(preload==0) func();
		};
		prj.find(".project_data_border").click(function()
		{
			$(grid).find(".project_item").find("img").toggle();
			return(false);
		});
	   //prj.find("img").hide();		
		
		prj.find("img").attr("src","data/projects/previews/"+projects[key].preview);		
		$(grid).append(prj);
	}
	$(grid).find(".lng_"+lng).show();
}

function load_json(file,func)
{
	 fetch(file)
     .then(function(response){
			 return response.json().then(function(data)
			 {
			 		func(data);	 
		    });
     }).catch(function(error){ 
   		console.log(error); 
     		});   
}

function load_data(func)
{
		load_json("data/projects/index.json?"+new Date().getTime(),function(data){
			projects=data;
			load_json("data/authors/index.json?"+new Date().getTime(),function(data){
					authors=data;	
					func();				
				})
		});	
}

function rand(from,to)
{
	return((Math.random() * to) + from);
}

var circles=[];
var lines;
var anim={"from":-20,"to":20,
			 "speed_from":200,"speed_to":1000,
			 "init_speed_from":500,"init_speed_to":1500};

function get_lines(mesh,x,y,r)
{
	var ret=[];
	for(var b=0;b<lines.length;b++)
	{
		for(var c=1;c<3;c++)
		{
			var cx=parseFloat($(lines[b]).attr("x"+c));
			var cy=parseFloat($(lines[b]).attr("y"+c));
		
			if(((cx>parseFloat(x-r)) && (cx<parseFloat(x+r))) &&
   			((cy>parseFloat(y-r)) && (cy<parseFloat(y+r))))
   			{
					//console.log("Punto encontrado ("+c+") en línea: " + b);		
					var l=[];
					l["index"]=b;
					l["point"]=c;
					ret.push(l);
   				
   				//$(lines[b]).css("stroke","#ff0000");
   				//break;
		  		}
		}
   }
   return(ret);
}
function init_mesh(mesh)
{
	$(mesh).find("polyline").hide();
	$(mesh).find("polygon").hide();
	lines=$(mesh).find("line");	
	//console.log("Lines: "+lines.length);
	
	var c=$(mesh).find("circle");
	//console.log("Circles: "+c.length);
	for(a=0;a<c.length;a++) //c.length;a++)
	{
  	   //console.log("Circle: "+a);
		var ci=[];
		ci["div"]=c[a];
		ci["cx"]=$(c[a]).attr("cx");
		ci["cy"]=$(c[a]).attr("cy");
		ci["r"]=$(c[a]).attr("r");
		ci["lines"]=get_lines(mesh,parseFloat(ci["cx"]),
										   parseFloat(ci["cy"]),
										   parseFloat(ci["r"])/2);	
		circles.push(ci);
		
		$(c[a]).css("left","-100px"); //ci["cx"]+"px");
		$(c[a]).css("top",ci["cy"]+"px");
	}
}

function start_animation(circle,tx,ty,time)
{
	var x=$(circle.div).attr("cx");
	var y=$(circle.div).attr("cy");
	
	$(circle.div).animate(
        	{
        		"left":(parseFloat(circle.cx)+tx),
        		"top":(parseFloat(circle.cy)+ty)
        	},
        	{
            step: function(val,fx){
            	
                 if(fx.prop=="left")
                 		$(circle.div).attr('cx', val);
                 else
                 		$(circle.div).attr('cy', val);
                 		
                 for(var c=0;c<circle.lines.length;c++)
                 {
                 	   var n=circle.lines[c].point;
                 	   var i=circle.lines[c].index;
                 	   $(lines[i]).attr("x"+n,$(circle.div).attr('cx'));
                 	   $(lines[i]).attr("y"+n,$(circle.div).attr('cy'));                 	   
                 }
                 
            	},
            done: function(){
            	tx=rand(anim.from,anim.to);
            	ty=rand(anim.from,anim.to);
            	start_animation(circle,tx,ty,rand(anim.init_speed_from,anim.init_speed_to));
            },
            duration: time
        	}
    	);
}
function animate_mesh(mesh)
{
	init_mesh(mesh);
	for(a=0;a<circles.length;a++) 
	{
		start_animation(circles[a],rand(anim.from,anim.to),
							 rand(anim.from,anim.to),rand(anim.speed_from,anim.speed_to));            
	}
}

function cookie_control()
{
	if($(".cookies_msg").length)	
	{
		if(localStorage["cookies_accept"]!=1)
		{
			$(".cookies_msg").fadeIn(1000);
			$(".cookies_accept").click(function()
			{
					$(".cookies_msg").fadeOut();
					localStorage["cookies_accept"]=1;
			});
		}	
	}		
}

function change_lng(lang)
{
	var ph=$("[placeholder]");
	$(".lng_"+lng).hide();
	lng=lang;	
	for(a=0;a<ph.length;a++)
		$(ph[a]).attr("placeholder",$(ph[a]).attr("placeholder_"+lng));
	$(".lng_"+lng).show();
}

function loadDone()
{
	change_lng(lng);
	$(".lng_"+lng).show();	
	$("[aria-lang]").click(function()
	{
		change_lng($(this).attr("aria-lang"));
		return(false);			
	});

 	$(".nav-link").click(function(event){
			var parts = $(this).attr("href").split("#");   		
			if(parts.length==1) return;
			
   		var target = $("#"+parts[1]);   		
   		if($(target).length) 
			{
				if($(target).length)
				{
					event.preventDefault();
			   	$('html, body').stop().animate({
            		scrollTop: $(target).offset().top
        			},500);
        		}
        	}
   });
}

$(document).ready(function()
{
	page_loaded=true;
	if(($("[include-HTML]").length==0) || (includes_loaded)) loadDone();	

   cookie_control();

	$("#contact_comment").hide();	
	
	if($(".projects_grid").length>0)
		load_data(function()
			{
				show_projects($(".projects_grid"),function(){
						setTimeout(function(){
							$(".projects_grid").removeClass("hidden");
							$(".projects_grid").parent().find(".loading").remove();
						},1000);				
				});
			});
	
   if($(".project_info").length>0)
   {
   	if(vars["id"])
   	{
   		load_data(function(){
				if(!projects[vars["id"]]) window.location.href=".";
   			else show_project_info(vars["id"]);
				});
   	}else{
   		window.location.href=".";
   	}
   }	
   
   /*$(".nav-link").click(function(event){
			var parts = $(this).attr("href").split("#");   		
			if(parts.length==1) return;
			
   		var target = $("#"+parts[1]);   		
   		if($(target).length) 
			{
				if($(target).length)
				{
					event.preventDefault();
			   	$('html, body').stop().animate({
            		scrollTop: $(target).offset().top
        			},500);
        		}
        	}
   });*/

   $("#check_subscription").click(function()
    {
    			if($(this).prop("disabled")) return(false);
    			
				var checked=$(this).find("input").prop('checked');	
			   $(".btn_lbl").removeClass("hidden");
				if(checked)
				{
			    	$(this).find("input").prop('checked', false)
			    	$("#contact_form").find(".no_subscription").prop("disabled",false);
			    	$(".btn_lbl_subscribe").addClass("hidden");
				}else{
			    	$(this).find("input").prop('checked', true)
			    	$("#contact_form").find(".no_subscription").prop("disabled",true);
			    	$(".btn_lbl_send").addClass("hidden");
			    }	
				return(false);
   	});

   $("#contact input, #contact textarea").on('input',function()
   {
   	$(".contact_result").hide();   
   });
   $("#btn_contact").click(function()
   {	  
   
   	$(".contact_result").hide();
		var name=$("#contact_name").val().trim();
		var email=$("#contact_email").val().trim();
		var remail=$("#contact_remail").val().trim();
		var msg=$("#contact_message").val().trim();
		var comment=$("#contact_comment").val();
		if((((email.length==0) || (remail.length==0)) || (name.length==0)) ||
					((msg.length==0) && (!$("#check_subscription").find("input").prop('checked')))) 
		{
			$(".error_empty").show();
			return(false);
      }		
		if(!email_isvalid(email))
		{
			$(".error_email").show();
			return(false);
		}
		if(email!=remail)
		{
			$(".error_remail").show();
			return(false);
		}
		
		$(this).addClass("hidden");
		$(".sending").removeClass("hidden");
				
 		var params={"function": "contact", "name":name, "email":email,"text":msg, "lng": lng,
 						 "comment":comment,"config":"mesh"};		
 	   if($("#check_subscription").find("input").prop('checked')) params["subscribe"]=1;
		$.post("https://2017.steamconf.com/soko/email.php",params)
		//$.post("http://localhost/gandi/email.php",params)
			   .done(function(data)
			   {
			   	//alert(data);
			   	var res=JSON.parse($.trim(data));
			   	//console.log(res);
			   	
					if(res.result=="ok") 
					{
			   		$(".sending").addClass("hidden");
						$(".result_ok").show();	
						
						$("#contact input, #contact textarea").prop('disabled', true);
   					$("#check_subscription").prop('disabled', true);
										
					}else{				
						$("#btn_contact").removeClass("hidden");
			   		$(".sending").addClass("hidden");
						$(".error_server").show();
   		   	}
			   }).fail(function(xhr, status, error)
			     {
						$("#btn_contact").removeClass("hidden");
			   		$(".sending").addClass("hidden");
						$(".error_server").show();
   		     });
   	return(false); 	     
   });

   var svg_mesh=document.getElementById("mesh-hero-bg-graphic");
   if(svg_mesh)
   {
   	svg_mesh.onload=function()
   	{
   		//animate_mesh($(this.contentDocument));
   	};
   	$("#mesh-hero-bg-graphic").attr("data",$("#mesh-hero-bg-graphic").attr("data-svg"));
   }
});
