(function(){
	//workflow to stick to: create | import geo, setup lights, render scene. Watch out for callbacks and async

	var container, camera, controls, scene, renderer, stats, isOrbit = false, isDebugCoords = false,
		house ={
			"currentView" : 0,
			"scenes" : [
				{ //array of scenes w their xyz and target xyz (if not specified its 0,0,0)
					"position" : {
						"x" : -9.55,
						"y" : 3.78,
						"z" : 6.93
					}
				},
				{
					"position" : {
						"x" : -.01,
						"y" : 4.41,
						"z" : 13
					}
				},
				{
					"position" : {
						"x" : 8.04,
						"y" : 8.6,
						"z" : 0.11
					}
				},
				{
					"position" : {
						"x" : 3.73,
						"y" : 1.27,
						"z" : -10.47
					}
				},
				{
					"position" : {
						"x" : -5.41,
						"y" : 1.36,
						"z" : -5.63
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
			color : (!hexColor) ? "#bada55": hexColor,
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

				current.mat = generateMaterial("#b3b3b5");
			};

			current.mesh = new THREE.Mesh(current.geo, current.mat); //[2]
			current.mesh.dialogueID = current.dialogueID; //[3]
			current.mesh.sceneIndex = current.sceneIndex; //[4]
			
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
		cylinderGuy = {
			geo : new THREE.CylinderGeometry(0.5,0.5,1,15,1), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : generateMaterial("#ffa740"),
			dialogueID : "cylinder",
			sceneIndex: 1
		},
		triangleGuy = {
			geo : new THREE.CylinderGeometry(0,0.5,1,3,1),
			mat : generateMaterial("#00ffd2"),
			dialogueID : "triangle",
			sceneIndex: 0
		},
		coneGuy = {
			geo : new THREE.CylinderGeometry(0,1,2,20,1),
			mat : generateMaterial("#4b4ff1"),
			dialogueID : "coneGuy",
			sceneIndex: 3
		},
		anotherConeGuy = {
			geo : new THREE.CylinderGeometry(0,0.5,1,10,1),
			mat : generateMaterial("#9a40ff"),
			dialogueID : "miniCone",
			sceneIndex: 2
		},
		otherCube = {
			geo : new THREE.CubeGeometry(1,1,0.2),
			mat : generateMaterial("#ffeb40"),
			dialogueID : "otherCube",
			sceneIndex: 4
		};


			//make mah meshes ><
			generateMesh([
				cylinderGuy,
				triangleGuy,
				coneGuy,
				anotherConeGuy,
				otherCube
			]);

		// largeCube.mesh.name = "largeCube";
		// largeCube.mesh.position.set(0,1.5,0); //center is height / 2
		triangleGuy.mesh.position.set(-5,0.5,2);
		anotherConeGuy.mesh.position.set(2, 3.5 ,0);
		coneGuy.mesh.position.set(3, 1 ,-6);
		

		cylinderGuy.mesh.rotation.set(0,0 , 90*(Math.PI/180));
		cylinderGuy.mesh.position.set(1,2,3); //have been rotated 90deg so my "height" is my radius

		otherCube.mesh.rotation.set(0,90*(Math.PI/180),0);
		otherCube.mesh.position.set(-2.6,2,-2.5);
	}


	//eeep callback
	function houseCallback() {
		theHouse.mesh.position.set(0,0,5);
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
		camera.position.set(house.scenes[0].position.x, house.scenes[0].position.y, house.scenes[0].position.z);

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
		var light = new THREE.PointLight( "#ffffff", 1, 60 );
		light.position.set( -10, 80, 10 );
		scene.add( light );

		var backLight = new THREE.PointLight( "#f3efd1", 0.4, 60 );
		backLight.position.set( 0, 40, -10 );
		scene.add( backLight );

		light = new THREE.DirectionalLight( "#f1f0cb", 0.8 ); //soft yellow
		light.position.set( 10, 80, 5 );
		scene.add( light );

		// is really bright for some reason
		// abmLight = new THREE.AmbientLight( "#404040" );
		// scene.add( abmLight );
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
	
	
	//interaction events
	function moveObject(dir){
		var incrementBy = (dir == "left") ? -1 : 1,
			newPosition = triangleGuy.mesh.position.x + incrementBy;

		new TWEEN.Tween(triangleGuy.mesh.position ).to( {
			x: newPosition}, 500 )
		.easing( TWEEN.Easing.Quadratic.Out).start();
	}

	//get who we touched and see if we cant move the camera there
	function moveToObject (vectorCoords) {
		//move mah cam to those coords
		new TWEEN.Tween(camera.position).to( {
			x: vectorCoords.x,
			y: vectorCoords.y,
			z: vectorCoords.z}, 500 )
		.easing( TWEEN.Easing.Quadratic.Out).start();
	}



	
	//----------------------------------------------------------------------------
	
	
	//moving camera logic
	//there is an array "sceneLocations" that has position(xyz) and optional camera rotate / lookat

	//moves back and forth in linear fashion from prev/next button
	function adjustSceneFromButton (dir) {
		//do we go forward or back?
		(dir=="next") ? house.currentView++ : house.currentView--;

		//what about endpoints?
		if (house.currentView < 0 ) {
			house.currentView = house.scenes.length -1 ;
		} else if (house.currentView > house.scenes.length - 1) {
			house.currentView = 0;
		}

		animateCameraToScene(house.currentView);
	}

	function adjustSceneFromObject (index) {
		house.currentView = (!index) ? 0 : index; //incase there is no associated index, reset
		animateCameraToScene(house.currentView);
	}

	//animate the camera to a scene location
	function animateCameraToScene(index) {
		// console.log("current view is:",house.currentView);

		//move mah cam to those coors
		new TWEEN.Tween(camera.position).to( {
			x: house.scenes[index].position.x,
			y: house.scenes[index].position.y,
			z: house.scenes[index].position.z}, 500 )
		.easing( TWEEN.Easing.Quadratic.Out).start();
	}


	//https://github.com/mrdoob/three.js/blob/master/examples/canvas_interactive_cubes_tween.html#L101
	function detectClickedObj (event) {
		//get where user clicked, cast a line and see who it touches
		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		
		projector.unprojectVector( vector, camera );

		var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

		var intersects = raycaster.intersectObjects( scene.children );

		//get me the guy we interesected / clicked
		if ( intersects.length > 0 ) {
			showShapeDialogue(intersects[0].object.dialogueID);

			//only show if not clicking the house
			if(intersects[0].object.name != "largeCube") {
				adjustSceneFromObject(intersects[0].object.sceneIndex);
			}

		}
	}


	//todo: clean up
	var $body = $("#body");

	$buttonLeft = $("<button>", {
		"class" : "camera__button camera__button__left",
		text : "previous"
	}).on("click", function(){
		adjustSceneFromButton("prev");
	}).appendTo($body);

	$buttonRight = $("<button>", {
		"class" : "camera__button camera__button__right",
		text : "next"
	}).on("click", function(){
		adjustSceneFromButton("next");
	}).appendTo($body);

	//show the current shape's HTML
	function showShapeDialogue (id) {
		$("div.popup").hide()
			.filter( function(){
				return $(this).attr("id") == id;
		}).show();
	}
})();