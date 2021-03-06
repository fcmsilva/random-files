//DEFINE IF MOBILE
var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
}
console.log("isMobile: ",isMobile)

//HELPERS
function clone(obj){
	return Object.assign({}, obj); 
}

function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}; 

//CAMERA HELPERS
function getCamera(videoElement){
	return new Promise((res,rej)=>{
		if (navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia({ video: true })
				.then(function (stream) {
				videoElement.srcObject = stream;
				res(videoElement);
			})
				.catch(function (e) {
					alert("É necessário permitir acesso à câmara")
					rej(e)
			});
		}
	});
}

function takePicture(videoElement, maxWidth, maxHeight){
	maxWidth = maxWidth || $(".body-wrapper").width()
	maxHeight = maxHeight || $(".body-wrapper").height()
	
	var resultb64="";
    console.log("got picture: w:"+$(videoElement).width()+", h:"+$(videoElement).height());
	var canvas = document.createElement("canvas");  
	
	canvas.width = $(videoElement).width();
	canvas.height = $(videoElement).height();
	
	console.log("true vals",canvas.width,canvas.height)
	console.log("maxs vals",maxWidth,maxHeight);

	let restrictWidth = Math.min(maxWidth,canvas.width);
	let restrictHeight = Math.min(maxHeight,canvas.height);
	let ratioW = canvas.width/restrictWidth;
	let ratioH = canvas.height/restrictHeight;
	canvas.width = restrictWidth;
	canvas.heigth = restrictHeight;
	console.log("canv vals",canvas.width,canvas.height);
	console.log("ratio vals",ratioW,ratioH);
	let ctx = canvas.getContext("2d")
	//flip the output of img to match mirror
	ctx.translate(canvas.width, 0);
	ctx.scale(-1, 1);
	//draw image to base64
	ctx.drawImage(videoElement,
				canvas.width*(1-ratioW)/2, canvas.height*(1-ratioH)/2,
				canvas.width*ratioW,canvas.height*ratioH);  
	resultb64=canvas.toDataURL();
	window.lastPicture = resultb64;
	console.log("image size: "+resultb64.length)
	return resultb64;
}

//--START

//-----------------------------------------
//--DATA STUFF
//-----------------------------------------


function newProfile(info){
	return {
		"handler":info.handler,   "name":info.name,
		"pageType":info.pageType, "bio":info.bio,
		"stats":{"following":0, "followers":0, "posts":0},
		"following":[],"followers":[],"posts":[],
		"profileImage":info.profileImage,
		"private": info.private || false
	}
}

function newThread(info){
	return {"users":info.users,"msgs":[]}
}

let getters = {
	getProfile: (handler)=>{return allData.profiles[handler]},
	getPostsFromUser: (handler)=>{return allData.posts.filter(x=>x.user==handler)},
	getFeed: (handles)=>{
		let list = []
		for(let i=0;i<handles.length;i++){
			list = list.concat(getters.getPostsFromUser(handles[i]))
		}
		return list.sort((b,a)=>(a.date-0)-(b.date-0))
	},
	getUserThreads: (handler)=>{
		return allData.directMessages.threads.filter(x=>x.users.includes(handler))
	},
	isFollowing: (a,b)=>{
		//return if a is following b (a & b are objs, not handlers)
		return b.followers.includes(a.handler) || a.following.includes(b.handler);
	},
	getGroupedStories: ()=>{
		let following = Object.values(getters.getProfile(sessionData.me).following)
		following.push(sessionData.me)
		let stories = allData.stories.filter(s=>following.includes(s.user))
		stories = Object.values(stories).sort((b,a)=>(a.date-0)-(b.date-0))
		let groups =  groupBy(stories,"user")
		for(let user in groups){
			groups[user].profileImg = getters.getProfile(user).profileImage
			groups[user].user = user
			
			groups[user] = groups[user].sort((a,b)=>(a.date-0)-(b.date-0))
			//groups[user].reverse();
		}
		return groups;
	}
}

let action = {
	likePost: (postObj) =>{
		//se ainda n gostei
		if(!postObj.usersLiked.includes(sessionData.me)){
			postObj.likes++;
			postObj.usersLiked.push(sessionData.me)
		}
	},
	unLikePost: (postObj) =>{
		if(postObj.usersLiked.includes(sessionData.me)){
			postObj.likes--;
			postObj.usersLiked = postObj.usersLiked.filter(e=>e!=sessionData.me);
		}
	},
	followUser: (userObj) => {
		let me = getters.getProfile(sessionData.me)
		if(me.following.indexOf(userObj.handler) == -1)
			me.following.push(userObj.handler)
		if(userObj.followers.indexOf(userObj.handler) == -1)
			userObj.followers.push(sessionData.me)

	},
	unFollow: (userObj)=>{
		let me = getters.getProfile(sessionData.me)
		if(me.following.indexOf(userObj.handler) != -1)
			me.following = me.following.filter(a=>{return (a!=userObj.handler)})
		if(userObj.followers.indexOf(sessionData.me) != -1)
			userObj.followers = userObj.followers.filter(a=>{return (a!=sessionData.me)})
	},
	post: (postObj) =>{
		allData.posts.push(postObj);
	},
	addStory: (imgUrl) => {
		allData.stories.push({user:sessionData.me,imgUrl:imgUrl,date: new Date()})
	},
	message: (userHandle,msg) =>{
		let thread = allData.directMessages.threads.filter((t)=>{
			return t.users.includes(userHandle) && t.users.includes(sessionData.me)
		})[0]
		if(!thread){
			thread = newThread({users:[userHandle,sessionData.me]})
			allData.directMessages.threads.push(thread)
		}
		console.log(thread)
		thread.msgs.push({
					content: msg.trim(),
					date: new Date().toISOString(),
					sender: sessionData.me
		})
	}
}

let sessionData = {
	"currentPage":"home-page",
	"me": "fsilva98",
	"gallery": {
		"imgs":[
			"https://raw.githubusercontent.com/fcmsilva/random-files/master/instastuff/gallery/imgs/img1.jpg",
			"https://raw.githubusercontent.com/fcmsilva/random-files/master/instastuff/gallery/imgs/img2.png",
			"https://raw.githubusercontent.com/fcmsilva/random-files/master/instastuff/gallery/imgs/img3.png",
			"https://raw.githubusercontent.com/fcmsilva/random-files/master/instastuff/gallery/imgs/img4.png"
		],
		"videos":[
			"https://raw.githubusercontent.com/fcmsilva/random-files/master/instastuff/gallery/videos/vid1.mp4"
		]
	},
	"pageHistory":[],
	"lastPage": ()=>{return sessionData.pageHistory[sessionData.pageHistory.length-2]},
	"currentPage": ()=>{return sessionData.pageHistory[sessionData.pageHistory.length-1]}
}

//page helpers
function goToLastPage(){
	sessionData.pageHistory.pop();
	let last = sessionData.pageHistory.pop();
	//let last = sessionData.lastPage();
	if(last)
		changePage(last[0],last[1])
}
function goToMyProfile(){
	changePage("profile-page",{handler:sessionData.me})
	$(".nav-btn.me").addClass("active")
}
function refreshPage(){
	let page = sessionData.currentPage();
	changePage(page[0],page[1])
}

let allData = {
	//----------------PROFILES--------------
	"profiles": {
		"fsilva98":{
			"handler":"fsilva98",
			"name":"Francisco Silva",
			"pageType":"Mercearia",
			"bio":"I code stuff @ FCT/UNL",
			"profileImage": "https://raw.githubusercontent.com/fcmsilva/random-files/master/instastuff/gallery/imgs/img2.png",
			//hardcoded ou calculado?
			"stats":{
				"following":2,
				"followers":3,
				"posts":1
			},
			//se calhar deixamos a relação follow/follower duplicada nos dois perfis para não complicar
			"following":["luisrosario98"],
			"followers":[],
			//notused->"posts":["postId1","postId2"]
		},
		"luisrosario98":newProfile({handler:"luisrosario98", name:"Luís Rosário", bio:"melides, born and raised", private: true, 				 
				"profileImage":"https://raw.githubusercontent.com/fcmsilva/random-files/master/instastuff/gallery/imgs/img1.jpg"})
	},
	//----------------POSTS--------------
	"posts":[
		{
			"user":"fsilva98",
			"likes":999,
			"usersLiked":[],
			"description": "I am a beacon of joy",
			"taggedUsers":["luisrosario98"],
			"taggedLocations":"France",
			"filters": "contrast(1)",
			"imgUrl":"https://cdn-images.threadless.com/threadless-media/artist_shops/shops/nathanwpyle/products/1376840/shirt-1586884808-f81cd21199f7783329cc8c3d2d0b4817.png?v=3&d=eyJvbmx5X21ldGEiOiBmYWxzZSwgImZvcmNlIjogZmFsc2UsICJvcHMiOiBbWyJ0cmltIiwgW2ZhbHNlLCBmYWxzZV0sIHt9XSwgWyJyZXNpemUiLCBbXSwgeyJ3aWR0aCI6IDk5Ni4wLCAiYWxsb3dfdXAiOiBmYWxzZSwgImhlaWdodCI6IDk5Ni4wfV0sIFsiY2FudmFzX2NlbnRlcmVkIiwgWzEyMDAsIDEyMDBdLCB7ImJhY2tncm91bmQiOiAiODg4ODg4In1dLCBbInJlc2l6ZSIsIFs4MDBdLCB7fV0sIFsiY2FudmFzX2NlbnRlcmVkIiwgWzgwMCwgODAwLCAiI2ZmZmZmZiJdLCB7fV0sIFsiZW5jb2RlIiwgWyJqcGciLCA4NV0sIHt9XV19",
			"date": new Date()
		} ,
		{
			"user":"luisrosario98",
			"likes":0,
			"usersLiked":[],
			"description": "heyyyy",
			"taggedUsers":[],
			"filters": "contrast(1)",
			"imgUrl":"https://raw.githubusercontent.com/fcmsilva/random-files/master/instastuff/gallery/imgs/img1.jpg",
			"date": new Date()-100
		} ,
		{
			"user":"luisrosario98",
			"likes":0,
			"selfDestruct":true,
			"usersLiked":[],
			"taggedUsers":[],
			"taggedLocations":[],
			"description":"",
			"filters":"",
			"imgUrl":"https://raw.githubusercontent.com/fcmsilva/random-files/master/instastuff/gallery/imgs/black.png",
			"date": new Date()-1000
		}
	],
	//----------------STORIES--------------
	"stories":[
		{
			//oldest
			"user":"luisrosario98",
			"imgUrl":"https://raw.githubusercontent.com/fcmsilva/random-files/master/instastuff/gallery/imgs/img1.jpg",
			"date": new Date()-2000
		},{
			"user":"luisrosario98",
			"imgUrl":"https://raw.githubusercontent.com/fcmsilva/random-files/master/instastuff/gallery/imgs/img2.png",
			"date": new Date()-1000
		},{
			//newest
			"user":"luisrosario98",
			"imgUrl":"https://raw.githubusercontent.com/fcmsilva/random-files/master/instastuff/gallery/imgs/img3.png",
			"date": new Date()
		},
		{
			"user":"fsilva98",
			"imgUrl":"https://raw.githubusercontent.com/fcmsilva/random-files/master/instastuff/gallery/imgs/img4.png",
			"date": new Date()
		}
	],
	//----------------DMS--------------
	"directMessages":{
		//uma sequencia de mensagens entre A e B
		"threads":[
			{
				"users":["fsilva98","luisrosario98"],
				"msgs":[
					//as datas não hão de servir pra nada, mas deixa
					{"sender":"fsilva98","content":"Boas","date":"2020-05-06T17:58:25.361Z"},
					{"sender":"luisrosario98","content":"Broas","date":"2020-05-06T17:59:25.361Z"}
				]
			},
			{
				"users":["fsilva98","mickey"],
				"msgs":[
					//as datas não hão de servir pra nada, mas deixa
					{"sender":"fsilva98","content":"NO","date":"2020-05-06T17:58:25.361Z"},
					{"sender":"mickey","content":"NOLAST","date":"2020-05-06T17:59:25.361Z"}
				]
			}
		]
		// 
	}
}


allData.profiles.jmonteiro = (newProfile({handler:"jmonteiro", name:"João Monteiro", bio:"", private: false}))

allData.profiles.jfernandes = (newProfile({handler:"jfernandes", name:"João Fernandes", bio:"", private: true}))

//test follow
action.followUser(getters.getProfile("luisrosario98"))
//-----------------------------------------
//--UI STUFF
//-----------------------------------------

let pageHandlers = {
	"home-page": homePageHandler,
	"profile-page": profilePageHandler,
	"messages-page": messagesPageHandler,
	"thread-page": threadPageHandler,
	"post-page":postPageHandler,
	"search-page":searchPageHandler,
	"gallery-page":galleryPageHandler,
	"gallery-photo-page":galleryPhotoPageHandler,
	"gallery-video-page":galleryVideoPageHandler,
	"edit-photo-page":editPhotoPageHandler,
	"post-photo-page":postPhotoHandler,
	"add-story-page":addStoryHandler,
	"story-view-page":storyViewHandler
}

function changePage(id,info, omitHistory){
	if(!omitHistory)
		sessionData.pageHistory.push([id,info])
	$(".page, .navbar,.bottom-nav").removeClass("active")
	$("#"+id).addClass("active");
	let customNavbar = $(".navbar[data-page*='"+id+"']");
	let defaultNavbar = $("#home-page-navbar");
	let customBottom = $(".bottom-nav[data-page*='"+id+"']");
	let deafultBottom = $("#default-bottom-nav");
	
	if(customNavbar.length){ customNavbar.addClass("active"); }
	else{ defaultNavbar.addClass("active"); }
	
	if(customBottom.length){  customBottom.addClass("active"); }
	else{ deafultBottom.addClass("active"); }
	pageHandlers[id](info);
	//
	deafultBottom.find(".nav-btn").removeClass("active")
	deafultBottom.find(".nav-btn[data-page*='"+id+"']").addClass("active")
}

//--------------------------------- 
//------------PAGE TRIGGERS---------------- 
//--------------------------------- 
		//homepage
function homePageHandler(){
	//load feed with all, TEMPORARY; TODO
	$("#home-page .post-list").html("");
	//my followers + me
	let following = Object.values(getters.getProfile(sessionData.me).following);
	following.push(sessionData.me);
	// 
	let postsElements = getters.getFeed(following).map(post=>{
		post.iLiked = (post.usersLiked.includes(sessionData.me))
		post.profileImage = getters.getProfile(post.user).profileImage;
		console.log(post.profileImage);
		let $el = templates.post(post);
	//	$el.attr("onclick","alert(2)");
		return $el;
	});

	postsElements.forEach(post=>{
		$("#home-page .post-list").append(post);
	})

	//homepageLoadTriggers();
	homepageLoadStories();
}

function homepageLoadStories(){
	let $storyRow = $("#home-page .story-row")
	$storyRow.find(".story:not(#my-story)").remove();
	let storyGroups = Object.values(getters.getGroupedStories());
	storyGroups.forEach(storyGroup=>{
		let allSeen = storyGroup.filter(s=>s.seen).length == storyGroup.length;
		if(allSeen)
			storyGroup.allSeen = true;
		let $story = templates.story(storyGroup);
		console.log(storyGroup,$story);
		$storyRow.append($story)
	})
	let myImage = getters.getProfile(sessionData.me).profileImage;
	$("#my-story .page-logo").css("background-image","url('"+myImage+"')")
	
}

//PROFILE PAGE------------------------------
function profilePageHandler(info){
	if(!getters.getProfile(info.handler)){
		goToLastPage();
		alert("Perfil não encontrado")
	}
	profilePageFillData(info);
	profilePageHooks(info);
	paymentHandler(info);
}

function profilePageFillData(info){
	let profile = getters.getProfile(info.handler);
	let me = getters.getProfile(sessionData.me)
	$("#profile-page .profile-name").text(profile.name)
	$("#profile-page .bio-section .bio").text(profile.bio)
	$("#profile-page-navbar .profile-name").text(info.handler)
	console.log(profile.private)
	if(profile.private && !getters.isFollowing(me,profile) && profile.handler != sessionData.me)
		$("#profile-page .profile-posts").addClass("private")
	else {
		$("#profile-page .profile-posts").removeClass("private")
		//if(getters.isFollowing(me,profile))
			
		//else
			
	}
	//fill stats
	$("#profile-page #stats-followers .stat-value").text(profile.followers.length)
	$("#profile-page #stats-following .stat-value").text(profile.following.length)
	$("#profile-page #stats-posts .stat-value").text(getters.getPostsFromUser(info.handler).length)
	
	$("#profile-page .posts-list").html("")
	let posts = getters.getPostsFromUser(info.handler);
	posts.map((p,i)=>{ p.imageindex=i; return p; })
	posts.forEach(o=>{
		$("#profile-page .posts-list").append(templates.postThumbnail(o))
	})
	
	let stories = getters.getGroupedStories()[info.handler]
	
	let $el = null;
	if(stories){
		let allSeen = stories.filter(s=>s.seen).length == stories.length;
		if(allSeen) stories.allSeen = true;
		stories.single = true;
		$el = templates.story(stories);
	}
	else
		$el = templates.pageLogo(profile)
	$("#profile-page .profile-logo").html($el);
	if(info.handler == sessionData.me)
		$("#profile-page .cta-section").hide();
	else 
		$("#profile-page .cta-section").show();
	
}

function profilePageHooks(info){
	let profile = getters.getProfile(info.handler)
	let me = getters.getProfile(sessionData.me)
	$(".follow-btn").removeClass("following").text("Seguir")
	console.log(getters.isFollowing(me,profile))
	if(getters.isFollowing(me,profile))
		$(".follow-btn").addClass("following").text("A Seguir")

	console.log(profile)
	//
	$(".follow-btn").off("click")
	$(".follow-btn").click(()=>{
		if(!getters.isFollowing(me,profile) && profile.private){
					let timeout = profile.private ? 5000 : 0;
					$(".follow-btn").addClass("following").text("Pedido Enviado")
					setTimeout(()=>{
						action.followUser(profile)
						refreshPage();
						$.toast(`${profile.name} aceitou o teu pedido para o seguires!`)
					},timeout)
		} else{
			if(!getters.isFollowing(me,profile))
				action.followUser(profile)
			else
				action.unFollow(profile);
			setTimeout(()=>{refreshPage()},50)
		}


	})
}

function paymentHandler(info){
	let $modal = $("#donate-modal")
	$modal.find(".pay-option").off("click").click(function(){
		$(".pay-option").removeClass("active")
		$(this).addClass("active") 
		$(".donate-btn").removeClass("hidden")
		$(".pay-form").addClass("hidden");
		if(this.id == "paypal-btn"){
			$("#paypal-form").removeClass("hidden")
		} else {
			$("#card-form").removeClass("hidden")
		}
	})
	$modal.find(".donate-btn").off("click").click(function(){
		let money = $modal.find("#donate-ammount").val()
		if(!(money > 0)){
			alert("Quantia tem de ser superior a zero");return;
		}
		let CVV = $modal.find("#CVV").val();
		let exp = $modal.find("#exp-date").val();
		let num = $modal.find("#card-num").val();
		if($("#paypal-form").hasClass("hidden") && (CVV.length!=3 || CVV == "000" || exp.length!=4 || num.length!=16)){
			alert("Dados de pagamento inválidos");return;
		} 
		if(!$modal.find("#paypal-address").val().match(/[^@]+@[^\.]+\..+/g) && $("#paypal-btn").hasClass("active")){
			alert("E-mail inválido");return;
		}
		let myName = getters.getProfile(sessionData.me).name
		action.message(info.handler, `${myName} enviou-lhe ${money}€!`)
		$.toast("Pagamento completado com sucesso!")
		$modal.find(".close-modal").click();
	})
}

//DMS PAGE------------------------------
function messagesPageHandler(){
	$("#messages-page .thread-list").html("");
	let threads = getters.getUserThreads(sessionData.me)
	threads.map((t,index)=>{
		let otherUsers = t.users.filter(u=>u!=sessionData.me)
				console.log(otherUsers,(getters.getProfile(otherUsers[0]) || {}))
		return {
			name: otherUsers,
			lastmsg: ( t.msgs[t.msgs.length-1] || ""),
			threadindex: index,
			img: (getters.getProfile(otherUsers[0]) || {}).profileImage
		}
	}).forEach(o=>{
		$("#messages-page .thread-list").append(templates.thread(o))
	})
	
}

//POST PAGE------------------------------
function postPageHandler(post){
	post.iLiked = (post.usersLiked.includes(sessionData.me))
	post.profileImage = getters.getProfile(post.user).profileImage;
	let $post = templates.post(post);
	$("#post-page .page-content").html($post);
} 

function threadPageHandler(threadindex){
	$("#thread-page .msg-list").html("");
	let thread = getters.getUserThreads(sessionData.me)[threadindex];
	thread.msgs.map((obj)=>{
		obj.me = obj.sender == sessionData.me;
		return obj;
	}).forEach(o=>{
		$("#thread-page .msg-list").append(templates.msg(o)); 
	})

	$( "#send-msg-form" ).unbind();
	$( "#send-msg-form" ).on('submit',(ev)=>{
		ev.preventDefault();
		let val = $("#send-msg-form input").val();
		if(val.trim().length > 0){
			if(val.trim().length > 512)
				alert("Mensagem deve conter menos de 512 caracteres")
			else{
				thread.msgs.push({
					content: val.trim(),
					date: new Date().toISOString(),
					sender: sessionData.me
				})
			}
		}
		$("#send-msg-form input").val("")
		threadPageHandler(threadindex);
	})
}

//SEARCH PAGE------------------------------
function searchPageHandler(data){
	let $input = $("input#search-profile")
	$input.val("").focus().trigger("keyup")
	let profiles = Object.values(allData.profiles);
	$("#search-page .result-list").html("")
	profiles.forEach(profile=>{
		$("#search-page .result-list").append(templates.searchProfile(profile))
	})
	$input.on("keyup",(ev)=>{
		let val = $input.val()
		console.log(val)
		$(".search-profile").removeClass("active")
		$(".search-profile").each(function(){
			let name = $(this).find(".profile-name").text();
			let handler = $(this).find(".profile-handler").text();
			if((name.includes(val) || handler.includes(val)) && val.length)
				$(this).addClass("active")
		})
		if(ev.keyCode == 13)
			$(".search-profile.active").eq(0).click()
	})
} 

function galleryPageHandler(data){
	$(".bottom-nav .tabs .tab").removeClass("active")	
	$(".bottom-nav .tabs .tab#gallery-tab").addClass("active")
	//fill images
	let $galleryEl = $("#gallery-page .gallery-selection").html("")
	sessionData.gallery.imgs.forEach((img)=>{
		let $imgEl = $("<img src='"+img+"'></img>");
		$galleryEl.append($imgEl);
		$imgEl.click(function(){
			$galleryEl.find("img").removeClass("active")
			$(this).addClass("active")
			let src = $(this).attr("src");
			$("#gallery-page .preview-section").css("background-image","url('"+src+"')")
		})
	})
	$(".gallery-selection img:first-child").click();
	$("#gallery-page-navbar .gallery-next").one("click",()=>{
		let url = $galleryEl.find("img.active").attr("src");
		changePage("edit-photo-page",url)
	});
	
}
function galleryPhotoPageHandler(data){
	$(".bottom-nav .tabs .tab").removeClass("active")	
	$(".bottom-nav .tabs .tab#photo-tab").addClass("active")	
	
	let video = $(".preview-section video")[0]
	getCamera(video)
	.catch(()=>{
		changePage("gallery-page")
	})
	$("#gallery-photo-page .take-picture-btn").off("click").click(()=>{
		let videoBounds = $(".body-wrapper").width();
		let imgUrl = takePicture(video,videoBounds,videoBounds)
		setTimeout(()=>{
			//$("#gallery-photo-page img").attr("src",imgUrl)
			changePage("edit-photo-page",imgUrl);
		},1)
	})
}
function galleryVideoPageHandler(data){
	$(".bottom-nav .tabs .tab").removeClass("active")	
	$(".bottom-nav .tabs .tab#video-tab").addClass("active")	
}

function editPhotoPageHandler(imgUrl){
	let $preview = $("#edit-photo-page .preview-section");
	let $filters = $("#edit-photo-page .filter-option");
	window.letsedit = imgUrl;
	$filters.find(".image").css("background-image","url('"+imgUrl+"')")
	$preview.css("background-image","url('"+imgUrl+"')")
	
	$filters.each(function(){
			$(this).find(".image").css("filter",$(this).data("filters"));
	})
	
	$filters.click(function(){
		let filters = $(this).data("filters");
		//
		$filters.removeClass("active")
		$(this).addClass("active")
		//
		$preview.css("filter",filters);
	})
	
	$("#edit-page-navbar .edit-next").one("click",()=>{
		let postObj = {
			"user":sessionData.me,
			"likes":0,
			"usersLiked":[],
			"description": "",
			"filters": $(".filter-option.active").data("filters"),
			"imgUrl":imgUrl,
			"taggedUsers":[],
			"taggedLocations":[],
			"date":new Date()
		}
		changePage("post-photo-page",postObj)
	})
	
	$("#edit-photo-page .filter-option.default").click();
}

function postPhotoHandler(postObj){
	let $page = $("#post-photo-page");
	let $thumbnail = $page.find(".image-thumb")
	$page.find("input").val("")
	$thumbnail.css("background-image", "url('"+postObj.imgUrl+"')").css("filter",postObj.filters)
	//back btn
	$("#post-page-navbar .back").one("click",()=>{
		changePage("edit-photo-page",postObj.imgUrl)
	})
	//textarea/tags plugin
	let taggablePeople = Object.values(getters.getProfile(sessionData.me).following);
	taggablePeople.push(sessionData.me);
	let taggableLocations = ["Lisboa","Madrid","Évora","Borba","Porto","Vila Nova de Gaia", "Almada", "Caparica"];
	console.log(taggablePeople)
	let peopleInput = document.querySelector('#post-photo-page .form-row textarea');
	let locationInput = document.querySelector('#post-photo-page .location-row textarea');
	peopleInput.value = locationInput.value = "";
	$("#post-photo-page .tagify").remove();
	let tagifySettings = {
		enforceWhitelist : true,
		delimiters       : null,
		whitelist        : taggablePeople,
		callbacks        : {add: console.log, remove: console.log},
		dropdown: {
			maxItems: 20,           // <- mixumum allowed rendered suggestions
			classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
			enabled: 0,             // <- show suggestions on focus
			closeOnSelect: true
		}
	};
  
  let tagifyPeople = new Tagify(peopleInput, tagifySettings);
	
	//location
	let locationTagSettings = clone(tagifySettings)
	locationTagSettings.whitelist = taggableLocations;
	locationTagSettings.enforceWhitelist = false;
	locationTagSettings.maxTags = 1;
	console.log(locationTagSettings)
	
	let tagifyLocations = new Tagify(locationInput, locationTagSettings);
	

	//post btn
	$("#post-page-navbar .post-next").off("click")
	$("#post-page-navbar .post-next").one("click",()=>{
		postObj.description = $page.find("#post-description").val()
		if(postObj.description.length > 512){
			alert("Descrição excede o limite de 512 carateres")
			$page.find("#post-description").val("")
		}
		else{
			action.post(postObj)
			postObj.taggedUsers = tagifyPeople.value.map(v=>{return v.value})
			if(tagifyLocations.value.length)
				postObj.taggedLocation = tagifyLocations.value[0].value
			changePage("profile-page",{"handler":postObj.user})
		}
	})
}

function addStoryHandler(){
	let $page = $("#add-story-page")
	let video = $page.find("video")[0]
	getCamera(video)
	.catch(()=>{
		goToLastPage();
	})
	
	$page.removeClass("picture-taken") 
	$page.find(".picture-btn, .share-btn").off("click")
	
	$page.find(".picture-btn").off("click").one("click",()=>{
		let imgUrl = takePicture(video,$(".body-wrapper").width(),$(".body-wrapper").height())
		$page.addClass("picture-taken")
		$page.find("#story-preview").attr("src",imgUrl);
		$page.find(".share-btn").off("click").one("click",()=>{
			action.addStory(imgUrl)
			changePage("home-page")
		})
	})
	
	
}

function storyViewHandler(data){
	let user = data.user;
	let isSingle = data.single;
	
	let storyGroupObj = getters.getGroupedStories()[user]
	let $imgList = $("#story-view-page .img-list");
	$("#story-view-page .username").text(user).off("click").click(()=>{
		changePage("profile-page",user);
	});
	$("#story-view-page .page-logo").css("background-image","url('"+storyGroupObj.profileImg+"')")
	let $imgs = []
	$("#story-view-page .clicker-left, #story-view-page .clicker-right").off("click")

	//last page that isn't a story
	function goToPrevPage(){
		let prevPage = ["home-page"]
		for(let i=sessionData.pageHistory.length-1;i>=0;i--){
			let page = sessionData.pageHistory[i]
			if(!page[0].includes("story")){
				prevPage = page;
				break;
			}
		}
		return changePage(prevPage[0],prevPage[1],true)
	}
	function nextAction(){
		let groups = getters.getGroupedStories()
		let storyKeys = Object.keys(groups)
		let groupIndex = storyKeys.indexOf(user)
		let nextGroup = groups[storyKeys[groupIndex+1]]

		if((groupIndex == storyKeys.length-1))
			return goToPrevPage()
		else{
			let thisSeen = storyGroupObj[storyGroupObj.length-1].seen
			let nextSeen = nextGroup[nextGroup.length-1].seen
			if((!thisSeen && nextSeen))
				return goToPrevPage()
			return changePage('story-view-page',{user:storyKeys[groupIndex+1]},true)
		} 
	}
	if(isSingle){
		nextAction = function(){goToPrevPage()}
	} 
	
	let imgIndex = 0;
	//get first story not seen
	for(let i=0;i<storyGroupObj.length;i++){
		if(!storyGroupObj[i].seen){
			imgIndex=i;break;
		} else if(i==storyGroupObj.length-1)
			imgIndex=0;
	}

	window.stepInterval = null;
	function show(i){
		clearInterval(stepInterval)
		if(i >= storyGroupObj.length)
			return nextAction();
		else if(i < 0)
			i = imgIndex = 0;
		
		stepInterval = setInterval(next,40000000)

		$imgList.css("background-image","url('"+storyGroupObj[i].imgUrl+"')")
		allData.stories.filter(s=>s.user==user)[i].seen = true

		let blocksAct = '<div class="prog-block active"></div>'.repeat(i)
		let blocksNot = '<div class="prog-block"></div>'.repeat(storyGroupObj.length-i)
		$(".progress-blocks").html(blocksAct+blocksNot)
		setTimeout(()=>{
			$(".progress-blocks .prog-block:nth-child("+(i+1)+")").addClass("active");
		},50);
	}
	show(imgIndex)
	
	function next(){show(++imgIndex)}
	function last(){show(--imgIndex)}
	
	$(".clicker-left").click(last)
	$(".clicker-right").click(next)
}
//--------------------------------- 
//------------GENERIC/NAVS---------------- 
//--------------------------------- 
function navbarLoad(){

}
function bottomNavLoad(){
	$(".bottom-nav .nav-btn").click(function(){
		//e.g. homepage
		let pageId = $(this).data("page")
		console.log(pageId);
		if(pageId) changePage(pageId)
	})
}
//--------------------------------- 
//------------TEMPLATES---------------- 
//--------------------------------- 
function postTrigger($postEl,postObj){
	$postEl.find(".image img").css("filter",postObj.filters);
	$postEl.find( ".image" ).dblclick(function() {
		$(this).find(".heart-overlay").addClass("active");
		setTimeout(()=>{$(this).find(".heart-overlay").removeClass("active")},1201);
		let heartBtn = $(this).parent().find(".heart-btn");
		if(!heartBtn.hasClass("liked")) heartBtn.click();
	});

	$postEl.find(".heart-btn").click(function(){
		$(this).toggleClass("liked");
		$(this).find("i").toggleClass("far");
		$(this).find("i").toggleClass("fas");
		if($(this).hasClass("liked")) 
			action.likePost(postObj);
		else
			action.unLikePost(postObj);
		$postEl.find(".like-count").text(postObj.likes);
		//emulate unavailable post
		if(postObj.selfDestruct){
			allData.posts = allData.posts.filter(p=>{return !p.selfDestruct})
			if(sessionData.currentPage()[0] == "post-page")
				goToLastPage();
			else 
				refreshPage();
			alert("Esta publicação já não está disponível")
		}
	})
	$postEl.find(".header .name").click(function(){
		let name = $(this).text();
		changePage("profile-page",{
			handler: name
		})
	});
}

function thumbTrigger($thumbEl,postObj){
	$thumbEl.find(".image-block").css("filter",postObj.filters)
	$thumbEl.click(()=>{
		changePage("post-page",postObj);
	});
}

let templateTriggers = {
	"post": postTrigger,
	"post-thumbnail":thumbTrigger,
	//"story":storyTrigger
}

function toTemplate(templateClass){
	return function(obj){
		let $el = $(Handlebars.compile($('<div>').append($('#templates > .'+templateClass).clone()).html())(obj));
		if(templateTriggers[templateClass])
			templateTriggers[templateClass]($el,obj);
		return $el;
	}
}

let templates = {
	post: toTemplate("post"),
	thread: toTemplate("thread"),
	msg: toTemplate("msg-block"),
	postThumbnail: toTemplate("post-thumbnail"),
	searchProfile: toTemplate("search-profile"),
	story: toTemplate("story"),
	pageLogo: toTemplate("page-logo")
}

//start
function load(){
	//CHANGE BACK
	changePage("home-page",{handler:"luisrosario98"}); 
	navbarLoad();
	bottomNavLoad();
} 


$("#profile-switch").on("change",()=>{
	let user = $("#profile-switch").val();
	sessionData.me = user;
	sessionData.pageHistory = []
	changePage("home-page")
})
$("#profile-switch").trigger("change")

load();