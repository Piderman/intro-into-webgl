//we dont have wegbl, so do this!
(function() {
	//images to load on rotate, load em all first so we have them cached?
	house = {
		currentView : 0,
		rotation : [
			{
				src : "/webgl/nowebgl/rotate-0.jpg"
			},
			{
				src : "/webgl/nowebgl/rotate-1.jpg"
			},
			{
				src : "/webgl/nowebgl/rotate-2.jpg"
			},
			{
				src : "/webgl/nowebgl/rotate-3.jpg"
			}
		],
		hitbox : [
			{ name : "bushes", rotateIndex : 0, dialogueID : "zoom0", position : {x: 640, y : 570} },
			{ name : "deck", rotateIndex : 1, dialogueID : "zoom1", position : {x: 480, y : 480} },
			{ name : "sideDoor", rotateIndex : 2, dialogueID : "zoom2", position : {x: 930, y : 400} },
			{ name : "rearRoof", rotateIndex : 3, dialogueID : "zoom3", position : {x: 870, y : 370} },
			{ name : "frontWindow", rotateIndex : 0, dialogueID : "zoom4", position : {x: 520, y : 260} },
			{ name : "sideRoof", rotateIndex : 2, dialogueID : "zoom5", position : {x: 560, y : 290} },
			{ name : "rearPool", rotateIndex : 3, dialogueID : "zoom6", position : {x: 570, y : 780} },
			{ name : "frontRoom", rotateIndex : 0, dialogueID : "zoom7", position : {x: 1080, y : 380} },
			{ name : "rearDoor", rotateIndex : 3, dialogueID : "zoom8", position : {x: 1070, y : 480} }
		]
	}
	//do button logic to "rotate" the imgs

	//

	init();
	
	function init(){
		createElements();
		cacheImages();

		createHitboxes();


	}
	function createElements() {
		$body = $("body");
		$container = $("#container");

		$buttonLeft = $("<button>", {
			"class" : "camera__button camera__button__left",
			text : "rotate left"
		}).on("click", function(){
			adjustSceneFromButton("prev");
		}).appendTo($body);

		$buttonRight = $("<button>", {
			"class" : "camera__button camera__button__right",
			text : "rotate right"
		}).on("click", function(){
			adjustSceneFromButton("next");
		}).appendTo($body);

		$houseImage = $("<img>").prependTo($container);

		$overlay = $("#overlay").fadeOut();

		$(".cameraCoords").remove();


		// $buttonBack = $("<button>", {
		// 	"class" : "camera__button camera__button__back",
		// 	"text" : "back"
		// }).appendTo($body).hide().on("click", function(){
		// 	returnToRotate();
		// 	toggleCameraControls("zoomed");
		// 	zoomedOutComplete();
		// });
	}

	function createHitboxes() {
		for (var i = 0; i < house.hitbox.length; i++) {
			$("<button>", {
				"class" : "hitbox",
				"text" : "show " + house.hitbox[i].dialogueID,
				"data-dialogue-id" : house.hitbox[i].dialogueID,
				"data-rotate-index" : house.hitbox[i].rotateIndex,
			}).css({
				"left": house.hitbox[i].position.x,
				"top": house.hitbox[i].position.y
			})
			.on("click", function(){
				showSceneDialogue($(this).data("dialogue-id"));
			}).appendTo($container);
		};

		//add to global once we have them
		$hitbox = $container.find("button.hitbox");
		setCurrentHitbox();
	}

	function showSceneDialogue(dialogueID) {
		$("div.popup").hide() //hide all
			.filter( function() {
				return $(this).attr("id") == dialogueID; //filtered to only the current one to then show
		}).show();
	}

	function setCurrentHitbox() {
		var $hitboxInView = $hitbox.filter(function(){
				return $(this).data("rotate-index") == house.currentView;
			}),
			$hitboxNotInView = $hitbox.filter(function(){
				return $(this).data("rotate-index") != house.currentView;
			});

		
		$hitboxInView.show();
		$hitboxNotInView.hide();
	}

	function adjustSceneFromButton (dir) {
		(dir=="next") ? house.currentView++ : house.currentView--;
		
		//what about endpoints?
		if (house.currentView < 0 ) {
			house.currentView = house.rotation.length -1 ;
		} else if (house.currentView > house.rotation.length - 1) {
			house.currentView = 0;
		}
		setImageViewTo(house.currentView);
		setCurrentHitbox();

	}
	//load all mah imgs once, starting from the top to the bottom so the last img loaded is index 0 
	function cacheImages() {
		for (var i = house.rotation.length - 1; i >= 0; i--) {
			setImageViewTo(i);
		};
	}

	function setImageViewTo(index){
		$houseImage.attr("src", house.rotation[index].src);
	}
})();