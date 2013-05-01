(function(){
	//workflow to stick to: create | import geo, setup lights, render scene. Watch out for callbacks and async

	var container, camera, controls, scene, renderer, stats, isOrbit = true, isDebugCoords = true,
		house = {
			"currentView" : 0, //index of camera pos arr to shoy
			"isNormal" : true, //are we normal or zoomed out?
			//array of zoomed in interactive positions. Theres aren't 1:1 with house rotations anymore
			"zoomedCoords" : [
				{//grass
				"position" : {
						"x" : -10.55,
						"y" : 1.14,
						"z" : 0.58
					}
				},
				{//deck
					"position" : {
						"x" : -.02,
						"y" : 2.28,
						"z" : 12.19
					}
				},
				{//side door
					"position" : {
						"x" : 6.91,
						"y" : 1.31,
						"z" : 0.58
					}
				},
				{ //rear roof
					"position" : {
						"x" : 0,
						"y" : 8.38,
						"z" : -3.57
					} ,
					"target" : {
						"x" : 0,
						"y" : 0,
						"z" : -2
					}
				},
				{//front window
					"position" : {
						"x" : -7.19,
						"y" : 1.18,
						"z" : -1.35
					},
					"target" : {
						"x" : 0,
						"y" : 1,
						"z" : -1
					}
				},
				{//side roof
					"position" : {
						"x" : 5.13,
						"y" : 5.4,
						"z" : 5.7
					},
					"target" : {
						"x" : 0,
						"y" : -1,
						"z" : 3
					}
				},
				{//rear ground
					"position" : {
						"x" : 4.34,
						"y" : 0.97,
						"z" : -10.91
					},
					"target" : {
						"x" : 3,
						"y" : 0,
						"z" : 0
					}
				},
				{//front room
					"position" : {
						"x" : -7.19,
						"y" : 2,
						"z" : 4
					},
					"target" : {
						"x" : 0,
						"y" : 1,
						"z" : 4
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
		},
		camTarget = { //init location of target, gets updated in render()
			"x":0,
			"y":0,
			"z":0
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
		initScene(); //startup three.js required things. pass "true" for helper objs

		createScenery(); //my custom objects
		createIcons(); //my icons, starts create, placement AND animation calls

		createLights();
		
		// renderer
		createRenderer(); //was running async here, so the house didn't exist yet but scene had been rendered
		

	}

	//helper for generic material with color w wireframe toggle
	function generateMaterial(hexColor, isWireframe) {
		createdMaterial = new THREE.MeshLambertMaterial({
			color : (!hexColor) ? "#f00" : hexColor,
			opacity : 0.6,
			transparent : true,
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

	/* mc 'API'
		each element in the scene has these props
		obj {
			mesh : go import me a mesh, generats the .mesh prop
			isRecieveset
			
			//for interactive && hitboxes
			rotateIndex : what rotation of the house do i belong to. Can only interact when the "view" matches
			

			//for interactive guy that needs to visually show he can be clicked
			

			//for hitbox
			zoomIndex : in the house.zoomedCoords, what index should i use //use != undefined  as test rather than an addition bool?
			
			dialogueID : 

		}

		icons to show interactive elements 

	*/

	//practice making and placing various geo guys
	function createScenery() {
		//need global for access
		theHouse = {
			// geo : new THREE.CubeGeometry(5,3,5),
			geo : importMeshFromFile("/webgl/assets/beach_house__mesh.js", "importedHouse"),
			dialogueID : "startup"
		},
		ground = {
			geo : new THREE.CubeGeometry(20, 0.1, 20), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : new THREE.MeshLambertMaterial({color: "#076e02"})
		},
		bush = {
			geo : new THREE.SphereGeometry(0.6,10,10), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : new THREE.MeshLambertMaterial({color: "#32c000", wireframe : true})
		},
		bush2 = {
			geo : new THREE.SphereGeometry(0.5,10,10), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : new THREE.MeshLambertMaterial({color: "#32c000", wireframe : true})
		},
		bush3 = {
			geo : new THREE.SphereGeometry(0.75,10,10), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : new THREE.MeshLambertMaterial({color: "#32c000", wireframe : true})
		};

		generateMesh([
			ground,
			bush,
			bush2,
			bush3,
		]);


		//position my guys
		ground.mesh.position.set(0,-0.05,0);
		bush.mesh.position.set(-7.1,0,-1);
		bush2.mesh.position.set(-7,0,0);
		bush3.mesh.position.set(-6.8,0,1);


		//scenery has been made and placed, create interactive clicks!
		createHitBoxes();
	}

	//icons need to be separate as they are not imported meshes and need custom attrs
	function createIcons(){
		//associated rotate index, place in scene, ("pointing" defaults to "-y")
		var icons = [
			{
				name : "bush",
				rotateIndex : 0,
				origin : {
					x : -6.8,
					y : 0,
					z : 0
				},
				position : {
					x : -6.8,
					y : 1.5,
					z : 0
				}
			},
			{
				name : "frontWindow",
				rotateIndex : 0,
				origin : {
					x: -3,
					y: 0,
					z: -2
				},
				position : {
					x: -4,
					y: 3,
					z: -2
				},
				pointing : "+x" // +/- x|y|z, -y default,
			},
			{
				name : "frontWindow2",
				rotateIndex : 0,
				origin : {
					x: -3.5,
					y: 0,
					z: 3
				},
				position : {
					x: -3.5,
					y: 3,
					z: 3
				},
				pointing : "+x" // +/- x|y|z, -y default,
			},
			{
				name : "deck",
				rotateIndex : 1,
				origin : {
					x: -2,
					y: -1,
					z: 7.5
				},
				position : {
					x: -2,
					y: 2.5,
					z: 7.5
				}
			},
			{
				name : "sideRoof",
				rotateIndex : 2,
				origin : {
					x: -2,
					y: -1,
					z: 7.5
				},
				position : {
					x: 3,
					y: 3.75,
					z: 4.5
				}
			},
			{
				name : "sideDoor",
				rotateIndex : 2,
				origin : {
					x: -2,
					y: -1,
					z: 7.5
				},
				position : {
					x: 3.5,
					y: 3,
					z: 0.75
				}
			},
			{
				name : "rearRoof",
				rotateIndex : 3,
				origin : {
					x: -2,
					y: -1,
					z: 7.5
				},
				position : {
					x: 0,
					y: 5,
					z: -3.5
				}
			},
			{
				name : "readGround",
				rotateIndex : 3,
				origin : {
					x: -2,
					y: -1,
					z: 7.5
				},
				position : {
					x: 4,
					y: 1.5,
					z: -8
				}
			}
		]

		//add the icons into the scene
		placeIconInScene(icons);

		// scene.add(bushIcon.mesh);;

	}

	//creates and places our icons, then calls setup animate
	function placeIconInScene(obj){
		var iconShape = new THREE.CylinderGeometry(0,0.2,0.5,4, 1, false),
			iconMaterial = new THREE.MeshLambertMaterial({color: "#ff0"});
		
		for (var i = 0; i < obj.length; i++) {
			var currentIcon = obj[i];

			//create the icon mesh from the settings
			currentIcon.mesh = new THREE.Mesh(iconShape, iconMaterial); //remember, .mesh is the three.js guy
			
			//add my custom attrs
			currentIcon.mesh.rotateIndex = currentIcon.rotateIndex;
			currentIcon.mesh.name = currentIcon.name + "Icon";
			currentIcon.mesh.pointing = currentIcon.pointing;
			currentIcon.mesh.isIcon = true; //so we can search in setInteractive()
			
			scene.add(currentIcon.mesh);

			// place it in the origin for animation
			currentIcon.mesh.position.set(currentIcon.origin.x, currentIcon.origin.y, currentIcon.origin.z );
			

			if (obj.pointing == "+x") {
				currentIcon.mesh.rotation.set(0,0, 90*(Math.PI/180));
			}
			//otherwise pointing down
			else if (!obj.pointing || obj.pointing == "-y"){
				currentIcon.mesh.rotation.set(0,0, 180*(Math.PI/180));
			}

			//now call the animation of them
			animateIcons(currentIcon);
		};

		//have and placed our guys, set the correct ones to active
		//cache my icons
		sceneIcons = scene.children.filter(function(element){
			if ( element.isIcon){
				return element;
			}
		});

		setActiveIcon();
	}

	//using the same obj as generateIconMesh, 
	function animateIcons(currentIcon, animationType) {
		//being called from a loop already, so we have the current icon AND its index in the loop
		//icon starts "hidden" in the geo from .origin. at its peak it uses .position, then drops to a lower based on .pointing

		var animToPeak = new TWEEN.Tween(currentIcon.mesh.position).to( {
				x: currentIcon.position.x,
				y: currentIcon.position.y,
				z: currentIcon.position.z}, 1000 )
			.easing( TWEEN.Easing.Quadratic.InOut),
			animToLower = new TWEEN.Tween(currentIcon.mesh.position).to( {
				x: currentIcon.position.x,
				y: currentIcon.position.y - 0.3,
				z: currentIcon.position.z}, 1000 )
			.easing( TWEEN.Easing.Quadratic.InOut);

		//loop type
		if (animationType) {

		}
		//chain for a loop
		animToPeak.chain(animToLower);
		animToLower.chain(animToPeak);

		animToPeak.start(); //pos is initially set to origin, so start from there
	}

	function createHitBoxes(){
		var hitboxMat = new THREE.MeshLambertMaterial({color: "#fff", wireframe : true});

		//these are simply bounding boxes for interacting ja?
		hitboxGrass = {
			geo : new THREE.CubeGeometry(1, 1, 3), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : hitboxMat,
			dialogueID : "zoom0",
			zoomIndex: 0,
			rotateIndex : 0
		},
		hitboxDeck = {
			geo : new THREE.CubeGeometry(2, 1.4, 1), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : hitboxMat,
			dialogueID : "zoom1",
			zoomIndex: 1,
			rotateIndex : 1
		},
		hitboxSide = {
			geo : new THREE.CubeGeometry(0.05, 2, 2), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : hitboxMat,
			dialogueID : "zoom2",
			zoomIndex: 2,
			rotateIndex : 2
		},
		hitboxRoof = {
			geo : new THREE.CubeGeometry(3, 0.5, 0.5), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : hitboxMat,
			dialogueID : "zoom3",
			zoomIndex: 3,
			rotateIndex : 3
		},
		hitboxFrontWindow = {
			geo : new THREE.CubeGeometry(0.05, 2, 2), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : hitboxMat,
			dialogueID : "zoom4",
			zoomIndex: 4,
			rotateIndex : 0
		},
		hitboxSideRoof = {
			geo : new THREE.CubeGeometry(0.5, 0.5, 0.5), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : hitboxMat,
			dialogueID : "zoom5",
			zoomIndex: 5,
			rotateIndex : 2
		},
		hitboxRearGround = {
			geo : new THREE.CubeGeometry(2, 0.5, 2), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : hitboxMat,
			dialogueID : "zoom6",
			zoomIndex: 6,
			rotateIndex : 3
		},
		hitboxFrontRoom = {
			geo : new THREE.CubeGeometry(0.2, 0.5, 0.5), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : hitboxMat,
			dialogueID : "zoom7",
			zoomIndex: 7,
			rotateIndex : 0
		}


		//make mah meshes ><
		generateMesh([
			hitboxGrass,
			hitboxDeck,
			hitboxSide,
			hitboxRoof,
			hitboxFrontWindow,
			hitboxSideRoof,
			hitboxRearGround,
			hitboxFrontRoom
		]);

		hitboxGrass.mesh.position.set(-7.2,0.5,0.2);
		hitboxDeck.mesh.position.set(-2,1,7.5);
		hitboxSide.mesh.position.set(3.5,1,0.75);
		hitboxRoof.mesh.position.set(0,4,-3.5);
		hitboxFrontWindow.mesh.position.set(-3.5,1,-2);
		hitboxSideRoof.mesh.position.set(3,2.75,4.5);
		hitboxRearGround.mesh.position.set(4,0.25,-8);
		hitboxFrontRoom.mesh.position.set(-3.5,1,3);
	}


	//eeep callback, does this mean scene is setup?
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
		//set rotation to start and objects to start
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
		// renderer = new THREE.CanvasRenderer( { antialias: false } );
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
		// if(!isOrbit) {
		// 	camera.lookAt(scene.position);
		// }

		//once tween has been updated, look at the updated (or 0 0 0) position
		//rotate ALL mah scene icons
		
		for (var i = 0; i < sceneIcons.length; i++) {
			//only rotate 90deg, then go back to 0
			sceneIcons[i].rotation.y = (sceneIcons[i].rotation.y > 90*(Math.PI/180)) ? 0 : sceneIcons[i].rotation.y + 0.05;
		}

		camera.lookAt(camTarget);
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
		
		house.isNormal = false;
		
		zoomCameraTo(zoomIndex);
		showSceneDialogue(dialogueID);

		toggleCameraControls();

		console.log("clicked coords",obj.position);
		if (isDebugCoords) {
			$debugX.text(obj.position.x);
			$debugY.text(obj.position.y);
			$debugZ.text(obj.position.z);
		}

	}

	//enable animation indicators
	function setActiveIcon() {

		var iconInView = sceneIcons.filter(function(element, index){
				// if (element.rotateIndex && element.rotateIndex == house.currentView) { // element.rotateIndex was returning falsey, balls
				if (element.isIcon && element.rotateIndex == house.currentView) {
					console.log(element);
					return element;
				}
			}),
			iconNotInView = sceneIcons.filter(function(element, index){
				if (element.isIcon && element.rotateIndex != house.currentView) {
					return element;
				}
			});

		console.log("show:", iconInView, "hide:" , iconNotInView);


		//set all not on this view "inactive"
		// for (var i = 0; i < scene.children.length; i++) {
		// 	if (scene.children[i].isIcon && scene.children[i].rotateIndex != house.currentView) {
		// 		// scene.children[i].material.opacity = 0.3;
		// 		scene.children[i].visible = false;
		// 	}
		// };
		

		for (var i = 0; i < iconInView.length; i++) {
			// iconInView[i].material.opacity = 1;
			iconInView[i].visible = true;
		};

		for (var i = 0; i < iconNotInView.length; i++) {
			// iconNotInView[i].material.opacity = 1;
			iconNotInView[i].visible = false;
		};
	}

	//moves back and forth in linear fashion from prev/next button
	function adjustSceneFromButton (dir) {
		// (!event) ? console.warn("not from a click") : event.preventDefault();

		//do we go forward or back?
		(dir=="next") ? house.currentView++ : house.currentView--;
		//what about endpoints?
		if (house.currentView < 0 ) {
			house.currentView = house.rotateCoords.length -1 ;
		} else if (house.currentView > house.rotateCoords.length - 1) {
			house.currentView = 0;
		}

		moveCameraToScene(house.currentView);
		
		//animate material to make it more interactive looking?
		setActiveIcon() //needs to also be called when clicking on an obj
	}

	//what controls do we need to display
	function toggleCameraControls(){
		//if zoomed in
		if (house.isNormal) {
			$buttonBack.hide();
			$buttonLeft.show();
			$buttonRight.show();
		} else {
			$buttonBack.show();
			$buttonLeft.hide();
			$buttonRight.hide();
		}


	}

	function returnToRotate(){
		moveCameraToScene(house.currentView);
		showSceneDialogue(null); //does this hide them all?
		house.isNormal = true;
	}


	//animate the camera to a scene location
	function moveCameraToScene(index) {
		//need coords to look at. This must be a tween here so we can call "camera.lookAt(camTarget)" in render update AFTER the tween has been updated
		camTarget = (!house.rotateCoords[index].target) ? {"x":0, "y":0, "z":0} : house.rotateCoords[index].target;
		
		// console.log("rotate target:",camTarget);

		//move mah cam to those coords, can either be normal house rotate or zoom in
		new TWEEN.Tween(camera.position).to( {
			x: house.rotateCoords[index].position.x,
			y: house.rotateCoords[index].position.y,
			z: house.rotateCoords[index].position.z}, 500 )
		.easing( TWEEN.Easing.Quadratic.Out).start();

		new TWEEN.Tween(camTarget).to( {
			x: camTarget.x,
			y: camTarget.y,
			z: camTarget.z}, 500 )
		.easing( TWEEN.Easing.Quadratic.Out).start();
	}

	function zoomCameraTo(index) {
		camTarget = (!house.zoomedCoords[index].target) ? {"x":0, "y":0, "z":0} : house.zoomedCoords[index].target;

		// console.log("zoom target:",camTarget);
		// console.log("current view is:",house.currentView);
		//move mah cam to those coors
		new TWEEN.Tween(camera.position).to( {
			x: house.zoomedCoords[index].position.x,
			y: house.zoomedCoords[index].position.y,
			z: house.zoomedCoords[index].position.z}, 1000 )
		.easing( TWEEN.Easing.Quadratic.Out).start();

		new TWEEN.Tween(camTarget).to( {
			x: camTarget.x,
			y: camTarget.y,
			z: camTarget.z}, 1000 )
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
					showZoomed(intersects[0].object); //will need to detect if we clicked the one we are looking at or not
				} /*else {
					console.log("clicked on an object not in this rotation")
					house.currentView = intersects[0].object.rotateIndex; //set the rotation
					moveCameraToScene(intersects[0].object.rotateIndex); //go to it
				}*/
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
		returnToRotate();
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