(function(){
	//workflow to stick to: create | import geo, setup lights, render scene. Watch out for callbacks and async

	var container, camera, controls, scene, renderer, stats;

	container = document.getElementById( 'container' );

	init();
	animate();

	function init() {
		createStats();
		initScene();

		createScenery();
		//importHouse();

		var geometry = new THREE.CubeGeometry(1,1,1);
		var material =  new THREE.MeshLambertMaterial( { color:"#bada55", shading: THREE.FlatShading } );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.set(2,1,1);

		scene.add( mesh );


		//will this work?
		var floorPlane = {
			geometry : new THREE.PlaneGeometry(10,10,10,10),
			material : new THREE.MeshLambertMaterial({
				color: "#fff",
				wireframe : true
			})
		};

		floorPlane.mesh = new THREE.Mesh(floorPlane.geometry, floorPlane.material)
		floorPlane.mesh.rotation.set(-90* (Math.PI/180), 0, 0);

		scene.add( floorPlane.mesh );


		createLights();
		// renderer
		createRenderer(); //was running async here, so the house didn't exist yet but scene had been rendered
		

	}

	//helper for generic material with color w wireframe toggle
	function createGenericMaterial(hexColor, isWireframe) {
		createdMaterial = new THREE.MeshLambertMaterial({
			color : hexColor,
			wireframe : (!isWireframe) ? false : true //means we can pass optional?
		});
		//return the created materal
		return createdMaterial;
	}

	//practice making and placing various geo guys
	function createScenery() {
		var genericMaterial = createGenericMaterial("#f00");

		console.log(genericMaterial);


	}

	function createStats () {
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';

		container.appendChild( stats.domElement );
	}


	//creates camera, controls and scene
	function initScene() {
		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.z = 5;

		controls = new THREE.OrbitControls( camera );
			controls.userPan = false;
			controls.userPanSpeed = 0; //0 means they cant pan?
		
		controls.addEventListener( 'change', render );

		scene = new THREE.Scene();
	}

	function createLights() {
		var light = new THREE.PointLight( "#ececcd", 0.5, 60 );
		light.position.set( -10, 10, 10 );
		scene.add( light );

		light = new THREE.DirectionalLight( "#fff" );
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


	// function 


	
	//----------------------------------------------------------------------------
	
	//three.js screen needed stuff oO 
	function createRenderer(){
		renderer = new THREE.WebGLRenderer( { antialias: false } );
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
	}

	function render() {
		renderer.render( scene, camera );
	}
})();