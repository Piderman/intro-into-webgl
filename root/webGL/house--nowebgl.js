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
		hitboxes : [
			{ name : "bushes", rotateIndex : 0, dialogueID : "zoom0" },
			{ name : "deck", rotateIndex : 1, dialogueID : "zoom0" },
			{ name : "sideDoor", rotateIndex : 2, dialogueID : "zoom0" },
			{ name : "rearRoof", rotateIndex : 3, dialogueID : "zoom0" }
		]
	}
	//do button logic to "rotate" the imgs

	//

	init();
	
	function init(){
		createElements();
		cacheImages();


	}
	function createElements() {
		$body = $("body");

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

		$houseImage = $("<img>").prependTo($("#container"));

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


	function adjustSceneFromButton (dir) {
		(dir=="next") ? house.currentView++ : house.currentView--;
		console.log(house.currentView);
		
		//what about endpoints?
		if (house.currentView < 0 ) {
			house.currentView = house.rotation.length -1 ;
		} else if (house.currentView > house.rotation.length - 1) {
			house.currentView = 0;
		}
		console.log("after", house.currentView);
		setImageViewTo(house.currentView);

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