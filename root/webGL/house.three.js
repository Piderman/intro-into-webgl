(function(){
	//workflow to stick to: create | import geo, setup lights, render scene. Watch out for callbacks and async

	var container, camera, controls, scene, renderer, stats, isOrbit = true, isDebugCoords = true,
		house ={
			"currentView" : 0, //index of camera pos arr to shoy
			"isNormal" : true, //are we normal or zoomed out?
			//array of zoomed in interactive positions. Theres aren't 1:1 with house rotations anymore
			"zoomedCoords" : [
				{
				"position" : {
						"x" : -10.55,
						"y" : 1.14,
						"z" : 0.58
					}
				},
				{
					"position" : {
						"x" : -.02,
						"y" : 2.28,
						"z" : 12.19
					}
				},
				{
					"position" : {
						"x" : 6.84,
						"y" : 1.88,
						"z" : 3.28
					}
				},
				{
					"position" : {
						"x" : -0.09,
						"y" : 6.11,
						"z" : -6.76
					}
				},
				{
					"position" : {
						"x" : -7.47,
						"y" : 2,
						"z" : -3.88
					}
				}

			],
			//array of house rotation locations
			"rotateCoords" : [
				{
					"position" : {
						"x" : -14.27,
						"y" : 5.53,
						"z" : 8.98
					}
				},
				{
					"position" : {
						"x" : 0.12,
						"y" : 3.98,
						"z" : 17.29
					}
					
				},
				{
					"position" : {
						"x" : 16.91,
						"y" : 4.22,
						"z" : 3.35
					}
					
				},
				{
					"position" : {
						"x" : 1.33,
						"y" : 10.06,
						"z" : -14.56
					}
				}
			]
		};


	if (isDebugCoords){
		$debugX = $("#cameraCoords__x");
		$debugY = $("#cameraCoords__y");
		$debugZ = $("#cameraCoords__z");
	} else {
		$(".cameraCoords").hide();
	}

	container = document.getElementById( 'container' );

	init();
	animate();



	
	//----------------------------------------------------------------------------
	
	
	//begin

	function init() {
		projector = new THREE.Projector(); //needed for testing who we clicked on
		createStats();
		initScene(true); //startup three.js required things. pass "true" for helper objs

		createScenery(); //my custom objects


		createLights();
		
		// renderer
		createRenderer(); //was running async here, so the house didn't exist yet but scene had been rendered
		

	}

	//helper for generic material with color w wireframe toggle
	function generateMaterial(hexColor, isWireframe) {
		createdMaterial = new THREE.MeshLambertMaterial({
			color : (!hexColor) ? "#ff0" : hexColor,
			// opacity : 0.5,
			// transparent : true,
			// wireframeLinewidth : 3,
			wireframe : (!isWireframe) ? false : true //means we can pass optional?
		});

		return createdMaterial;
	}


	//----------------------------------------------------------------------------


	//create mesh from all obj we pass
	/*
	1: force default material if there isn't one
	2: create and insert new mesh
	3: "onclick" of an mesh, we cannot log the "largeCube" for eg, so we make a new prop to send ours to
	4: same for the associated scene reference
	*/
	function generateMesh(obj) {
		for (var i = 0; i < obj.length; i++) { //[1]
			var current = obj[i];

			if (!current.mat) { //[1]
				console.warn("No material passed, using default 'generateMaterial()'");

				current.mat = generateMaterial();
			};

			current.mesh = new THREE.Mesh(current.geo, current.mat); //[2]
			current.mesh.dialogueID = current.dialogueID; //[3]
			current.mesh.zoomIndex = current.zoomIndex; //[4]
			current.mesh.rotateIndex = current.rotateIndex; //[4]
			
			scene.add(current.mesh);
		};
	}


	//practice making and placing various geo guys
	function createScenery() {
		//need global for access
		theHouse = {
			// geo : new THREE.CubeGeometry(5,3,5),
			geo : importMeshFromFile("/webgl/assets/beach_house__mesh.js", "importedHouse"),
			dialogueID : "startup"
		},
		//these are simply bounding boxes for interacting ja?
		interGrass = {
			geo : new THREE.CubeGeometry(5, 0.05, 13), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : generateMaterial(),
			dialogueID : "zoom0",
			zoomIndex: 0,
			rotateIndex : 0
		},
		interDeck = {
			geo : new THREE.CubeGeometry(2, 1.4, 1), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : generateMaterial(),
			dialogueID : "zoom1",
			zoomIndex: 1,
			rotateIndex : 1
		},
		interSide = {
			geo : new THREE.CubeGeometry(0.05, 2, 2), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : generateMaterial(),
			dialogueID : "zoom2",
			zoomIndex: 2,
			rotateIndex : 2
		},
		interRoof = {
			geo : new THREE.CubeGeometry(3, 0.5, 0.5), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : generateMaterial(),
			dialogueID : "zoom3",
			zoomIndex: 3,
			rotateIndex : 3
		},
		interFrontWindow = {
			geo : new THREE.CubeGeometry(0.05, 2, 2), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : generateMaterial(),
			dialogueID : "zoom4",
			zoomIndex: 4,
			rotateIndex : 0
		}


		//make mah meshes ><
		generateMesh([
			interGrass,
			interDeck,
			interSide,
			interRoof,
			interFrontWindow
		]);

		//position my guys
		interGrass.mesh.position.set(-5,0,1.5);
		interDeck.mesh.position.set(-2,1,7.5);
		interSide.mesh.position.set(3.5,1,0.75);
		interRoof.mesh.position.set(0,4,-3.5);
		interFrontWindow.mesh.position.set(-3.5,1,-2);
	}


	//eeep callback
	function houseCallback() {
		theHouse.mesh.position.set(0,0,5);

		// for (var i = 0; i < theHouse.mesh.material.materials.length; i++) {
		// 	theHouse.mesh.material.materials[i].wireframe = true
		// };
	}

	function createStats () {
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';

		container.appendChild( stats.domElement );
	}


	//creates camera, controls and scene
	function initScene(isHelper) {
		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.set(10, 40, -10);
		moveCameraToScene(0);

		if (isOrbit){
			controls = new THREE.OrbitControls( camera );
			controls.userPan = false; //disables keyboard
			controls.userPanSpeed = 0; //no pan AT all, even rMouse
			
			controls.addEventListener( 'change', render );
		}

		scene = new THREE.Scene();


		//helper functions in init: axis debugger and grid
		if (isHelper){
			var helpers = {
				axis : new THREE.AxisHelper(2),
				grid : new THREE.GridHelper(10, 1) //units FROM origin, units per divisional line
			};


			helpers.axis.position.set(-10, 1, 0);
			scene.add(helpers.axis);
			scene.add(helpers.grid);
		}
		// importedHouse.position.set(0,0,5);

	}

	function createLights() {
		var light = new THREE.HemisphereLight( "#fff5cb", "#3c3a30", 1); //3c3a30
		light.position.set( -10, 20, 10 );
		scene.add( light );
		
		light = new THREE.PointLight( "#fff5cb", 1, 60 );
		light.position.set( 0, 10, 0 );
		scene.add( light );

		// light = new THREE.PointLight( "#f3efd1", 1, 60 );
		// light.position.set( 0, 5, -20 );
		// scene.add( light );

		// light = new THREE.AmbientLight( "#5e5a4b" );
		// scene.add( light );
	}

	//import a model from bender using three.js export plugin
	function importMeshFromFile(pathToFile, friendlyName) {
		var loader = new THREE.JSONLoader();
		
		loader.load( pathToFile, function(geometry, material){

			var importedMaterial = new THREE.MeshFaceMaterial(material),
				importedMesh = new THREE.Mesh(geometry, importedMaterial);

			importedMesh.name = friendlyName;
			scene.add(importedMesh);

			if (friendlyName == "importedHouse") {
				theHouse.mesh = importedMesh;
				houseCallback();
			}
		});
	}


	$("#container").on("click", function(event){
		detectClickedObj(event);
	});


	
	//----------------------------------------------------------------------------
	
	//three.js screen needed stuff. Caution : science dog
	function createRenderer(){
		renderer = new THREE.WebGLRenderer( { antialias: false } );
		renderer.setSize( window.innerWidth, window.innerHeight );

		container.appendChild( renderer.domElement );

		//

		window.addEventListener( 'resize', onWindowResize, false );
		render();
	}
	
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

		render();
	}

	function animate() {
		requestAnimationFrame( animate );
		
		if(isOrbit) {
			controls.update();
		}
		
		stats.update();

		


		if (isDebugCoords) {
			$debugX.text(camera.position.x);
			$debugY.text(camera.position.y);
			$debugZ.text(camera.position.z);
		}

		render();

	}

	function render() {
		TWEEN.update();

		//forces centering?
		if(!isOrbit) {
			camera.lookAt(scene.position);
		}

		renderer.render( scene, camera );

	}





	//----------------------------------------------------------------------------
	
	
	//moving camera logic
	//there is an array "sceneLocations" that has position(xyz) and optional camera rotate / lookat

	/*
	moving the camera:
	prev/next rotate around the house and adjust the scene. clicking on the interactive object in THAT scene will zoom
	in and toggle the visibility of the buttons and shows the content for that scene. clicking "back" zooms the camera back out

	*/

	//when we click on an interactive guy, need to fire these two guys
	function showZoomed(obj) {
		var zoomIndex = obj.zoomIndex,
			dialogueID = obj.dialogueID;
		
		zoomCameraTo(zoomIndex);
		showSceneDialogue(dialogueID);

		toggleCameraControls();


	}

	//obj are transparent if not in the same rotation
	function setInteractiveObject() {
		var currentElement = scene.children.filter(function(element, index){
				// if (element.rotateIndex && element.rotateIndex == house.currentView) { // element.rotateIndex was returning falsey, balls
				if (element.rotateIndex == house.currentView) {
					return element;
				}
			});
		console.log("set interactive to ", house.currentView);

		//set all not on this view "inactive"
		for (var i = 0; i < scene.children.length; i++) {
			if (scene.children[i].rotateIndex != undefined) {
				scene.children[i].material.opacity = 1;
			}
		};
		
		//set all on this view active
		for (var i = 0; i < currentElement.length; i++) {
			currentElement[i].material.opacity = 0.5;
		};
	}

	//moves back and forth in linear fashion from prev/next button
	function adjustSceneFromButton (dir) {
		//do we go forward or back?
		(dir=="next") ? house.currentView++ : house.currentView--;
		console.log("clicked");
		//what about endpoints?
		if (house.currentView < 0 ) {
			house.currentView = house.rotateCoords.length -1 ;
		} else if (house.currentView > house.rotateCoords.length - 1) {
			house.currentView = 0;
		}

		moveCameraToScene(house.currentView);
		
		//animate material to make it more interactive looking?
		setInteractiveObject() //needs to also be called when clicking on an obj
	}

	//what controls do we need to display
	function toggleCameraControls(mode){
		$buttonBack.toggle();
		$buttonLeft.toggle();
		$buttonRight.toggle();

		//return to zoomed out view
		if (mode == "zoomed" ) {
			moveCameraToScene(house.currentView);
			showSceneDialogue(null); //does this hide them all?
			house.isNormal = true;
		}
	}


	//animate the camera to a scene location
	function moveCameraToScene(index) {
		// console.log("current view is:",house.currentView);
		
		//move mah cam to those coords, can either be normal house rotate or zoom in
		new TWEEN.Tween(camera.position).to( {
			x: house.rotateCoords[index].position.x,
			y: house.rotateCoords[index].position.y,
			z: house.rotateCoords[index].position.z}, 500 )
		.easing( TWEEN.Easing.Quadratic.Out).start();
	}

	function zoomCameraTo(index) {
		// console.log("current view is:",house.currentView);
		//move mah cam to those coors
		new TWEEN.Tween(camera.position).to( {
			x: house.zoomedCoords[index].position.x,
			y: house.zoomedCoords[index].position.y,
			z: house.zoomedCoords[index].position.z}, 1000 )
		.easing( TWEEN.Easing.Quadratic.Out).start();
	}


	//https://github.com/mrdoob/three.js/blob/master/examples/canvas_interactive_cubes_tween.html#L101
	function detectClickedObj (event) {
		//get where user clicked, cast a line and see who it touches
		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		
		projector.unprojectVector( vector, camera );

		raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

		var intersects = raycaster.intersectObjects( scene.children );

		//get me the guy we interesected / clicked
		if ( intersects.length > 0 ) {

			//click a guy and go to his zoom index ONLY when we are on the same scene, solves moving the camera through the house n stuff
			if(intersects[0].object.name != "importedHouse") {
				
				//zoom in on the guy we clicked
				if (intersects[0].object.rotateIndex == house.currentView) {
					// house.isNormal = false;
					showZoomed(intersects[0].object); //will need to detect if we clicked the one we are looking at or not
				} else {
					console.log("clicked on an object not in this rotation")
					house.currentView = intersects[0].object.rotateIndex; //set the rotation
					moveCameraToScene(intersects[0].object.rotateIndex); //go to it
				}
			}

		}
	}


	//todo: clean up
	var $body = $("#body");

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

	$buttonBack = $("<button>", {
		"class" : "camera__button camera__button__back",
		"text" : "back"
	}).appendTo($body).hide().on("click", function(){
		toggleCameraControls("zoomed");
	});

	//show the current shape's HTML
	function showSceneDialogue (id) {
		$("div.popup").hide()
			.filter( function(){
				return $(this).attr("id") == id;
		}).show();
	}
})();