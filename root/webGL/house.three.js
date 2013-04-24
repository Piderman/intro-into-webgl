(function(){
	//workflow to stick to: create | import geo, setup lights, render scene. Watch out for callbacks and async

	var container, camera, controls, scene, renderer, stats;

	container = document.getElementById( 'container' );

	init();
	animate();

	function init() {
		projector = new THREE.Projector(); //needed for testing who we clicked on
		createStats();
		initScene(true);

		createScenery();
		//importHouse();

		var geometry = new THREE.CubeGeometry(1,1,1);
		var material =  new THREE.MeshLambertMaterial( { color:"#bada55", shading: THREE.FlatShading } );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.set(2,1,1);

		scene.add( mesh );


		//will this work?
		// var floorPlane = {
		// 	geometry : new THREE.PlaneGeometry(20,20,20,20), //x-z, segments. keep as 1:1 so we can get good sense of scale/grid
		// 	material : new THREE.MeshLambertMaterial({
		// 		color: "tomato",
		// 		wireframe : true
		// 	})
		// };

		// floorPlane.mesh = new THREE.Mesh(floorPlane.geometry, floorPlane.material)
		// floorPlane.mesh.rotation.set(-90* (Math.PI/180), 0, 0);

		// scene.add( floorPlane.mesh );



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
			
			scene.add(current.mesh);
		};
	}


	//practice making and placing various geo guys
	function createScenery() {
		//need global for access
		largeCube = {
			geo : new THREE.CubeGeometry(5,5,5),
			dialogueID : "largeCube"
		},
		cylinderGuy = {
			geo : new THREE.CylinderGeometry(1,1,3,15,1), //radius top, radius bottom, height, segments, height segments, open ended? 
			mat : generateMaterial("#ffa740"),
			dialogueID : "cylinder"
		},
		triangleGuy = {
			geo : new THREE.CylinderGeometry(0,1,2,3,1),
			mat : generateMaterial("#00ffd2"),
			dialogueID : "triangle"
		},
		coneGuy = {
			geo : new THREE.CylinderGeometry(0,1,2,20,1),
			mat : generateMaterial("#0619a4"),
			dialogueID : "cone"
		},
		anotherConeGuy = {
			geo : new THREE.CylinderGeometry(0,0.5,1,10,1),
			mat : generateMaterial("#9a40ff")
		};


			//make mah meshes ><
			generateMesh([
				cylinderGuy,
				largeCube,
				triangleGuy,
				coneGuy,
				anotherConeGuy
			]);

			//can we move once its added
			largeCube.mesh.position.set(-6,3.5,-8); //center is height / 2
			triangleGuy.mesh.position.set(-5,1,2);
			coneGuy.mesh.position.set(2, 1 ,-8);
			anotherConeGuy.mesh.position.set(1, 0.5 ,-6);

			cylinderGuy.mesh.rotation.set(0,0 , 90*(Math.PI/180));
			cylinderGuy.mesh.position.set(2,1,0); //have been rotated 90deg so my "height" is my radius
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
		camera.position.set(0, 5, 10);

		controls = new THREE.OrbitControls( camera );
			controls.userPan = false; //disables keyboard
			controls.userPanSpeed = 0; //no pan AT all, even rMouse
		
		controls.addEventListener( 'change', render );

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
	}

	function createLights() {
		var light = new THREE.PointLight( "#fff", 0.8, 60 );
		light.position.set( -10, 10, 10 );
		scene.add( light );

		light = new THREE.DirectionalLight( "#f1f0cb", 0.8 ); //soft yellow
		light.position.set( 20, 20, 20 );
		scene.add( light );

		//is really bright for some reason
		// abmLight = new THREE.AmbientLight( "#000 " );
		// scene.add( abmLight );
	}

	//import a model from bender using three.js exported
	function importHouse() {
		var loader = new THREE.JSONLoader();
		// loader.load( "/webgl/assets/houseMesh.js", insertGeo);

		//if the JSON has a material, we use "material" to get it
		loader.load( "/webgl/assets/houseUV.js", function(geometry, material){
			var house__Material = new THREE.MeshFaceMaterial(material)
				houseMesh = new THREE.Mesh(geometry, house__Material);
			
			scene.add(houseMesh);

			//needed in the callback so we now its complete. Do we need a fn() for when ALL imports are done?
		});
	}


	$("#container").on("click", function(event){
		detectClickedObj(event);

		//testing tween from canvas_interactive_cubes_tween
		// new TWEEN.Tween(largeCube.mesh.rotation ).to( {
		// 	x: Math.random() * 2 * Math.PI,
		// 	y: Math.random() * 2 * Math.PI,
		// 	z: Math.random() * 2 * Math.PI }, 2000 )
		// .easing( TWEEN.Easing.Elastic.Out).start();

		
	});


	
	//----------------------------------------------------------------------------
	
	//three.js screen needed stuff. Caution : science dog
	function createRenderer(){
		renderer = new THREE.WebGLRenderer( { antialias: false } );
		// renderer = new THREE.CanvasRenderer( { antialias: false } );
		// renderer.setClearColor( scene.fog.color, 1 );
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
		controls.update();
		stats.update();

		render();
	}

	function render() {
		TWEEN.update();
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

	//works in in linear sequence
	/*function moveCamera(sceneNumber){
		var incrementBy = (dir == "left") ? -1 : 1,
			newPosition = triangleGuy.mesh.position.x + incrementBy;

		new TWEEN.Tween(triangleGuy.mesh.position ).to( {
			x: newPosition}, 500 )
		.easing( TWEEN.Easing.Quadratic.Out).start();
	}*/


	//https://github.com/mrdoob/three.js/blob/master/examples/canvas_interactive_cubes_tween.html#L101
	function detectClickedObj (event) {
		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		
		projector.unprojectVector( vector, camera );

		var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

		var intersects = raycaster.intersectObjects( scene.children );

		//get me the guy we interesected / clicked
		if ( intersects.length > 0 ) {
			showShapeDialogue(intersects[0].object.dialogueID);
		}
	}


	//todo: clean up
	var $body = $("#body");

	$buttonLeft = $("<button>", {
		"class" : "camera__button camera__button__left",
		text : "move left"
	}).on("click", function(){
		moveObject("left");
	}).appendTo($body);

	$buttonRight = $("<button>", {
		"class" : "camera__button camera__button__right",
		text : "move right"
	}).on("click", function(){
		moveObject("right");
	}).appendTo($body);

	function showShapeDialogue (id) {
		$("div.popup").hide()
			.filter( function(){
				return $(this).attr("id") == id;
		}).show();
	}
})();