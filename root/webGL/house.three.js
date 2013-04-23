(function(){
	var container, camera, controls, scene, renderer, stats;

	container = document.getElementById( 'container' );

	init();
	animate();

	function init() {
		createStats();
		initScene();

		createLights();

		importHouse();

		var geometry = new THREE.CubeGeometry(1,1,1);
		var material =  new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.set(2,1,1);

		scene.add( mesh );



		// renderer
		createRenderer();
		

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
		var light = new THREE.PointLight( 0xff0000, 1, 100 );
		light.position.set( 50, 50, 50 );
		scene.add( light );

		// light = new THREE.DirectionalLight( "#e7e7d6" );
		// light.position.set( 10, 10, 10 );
		// scene.add( light );

		light = new THREE.AmbientLight( "#e7e7d6" );
		scene.add( light );
	}

	//import a model from bender using three.js exported
	function importHouse() {
		var loader = new THREE.JSONLoader();
		// loader.load( "/webgl/assets/houseMesh.js", insertGeo);
		loader.load( "/webgl/assets/houseUV.js", function(geometry, material){
			var house__Material = new THREE.MeshFaceMaterial(material)
				houseMesh = new THREE.Mesh(geometry, house__Material);
			
			scene.add(houseMesh);
		});

	}




	
	//----------------------------------------------------------------------------
	
	//three.js screen needed stuff oO 
	function createRenderer(){
		renderer = new THREE.WebGLRenderer( { antialias: false } );
		// renderer.setClearColor( scene.fog.color, 1 );
		renderer.setSize( window.innerWidth, window.innerHeight );

		container.appendChild( renderer.domElement );

		//

		window.addEventListener( 'resize', onWindowResize, false );
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