/*
*
* This file will load the music and create cubes that will react with the beat of the music
*
*/

// Variables for the audio
var audioContext = new AudioContext(),
	src, 
	source,
	fft,
	buffer,
	data = new Uint8Array(),
	boost = 0,
	samples = 512;

// Variables for the cubes
var scene = new THREE.Scene(),
	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000),
	renderer = new THREE.WebGLRenderer(),
	cubes = new Array(),
	controls;

// Creates the particles in the scene
var particles = new THREE.Geometry;

for (var p = 0; p < 10000; p++) 
{
    var particle = new THREE.Vector3(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 500 - 250);
    particles.vertices.push(particle);
}

// Adds the material to the particles in the scenee
var particleMaterial = new THREE.ParticleBasicMaterial(
	{
		size: 2, 
		map: THREE.ImageUtils.loadTexture('texture/spark.png'), 
		blending: THREE.AdditiveBlending,
		transparent: true
	});

// Adds the particles to the scene
var particleSystem = new THREE.ParticleSystem(particles, particleMaterial);
scene.add(particleSystem);

document.body.appendChild(renderer.domElement);

// Creates the cubes
var i = 0;
for(var x = 0; x < 30; x += 2) 
{
	var j = 0;
	cubes[i] = new Array();
	for(var y = 0; y < 30; y += 2) 
	{
		var geometry = new THREE.CubeGeometry(1, 1, 1);
		
		var material = new THREE.MeshPhongMaterial(
		{
			color: randomColour(),
			map: THREE.ImageUtils.loadTexture('texture/blur_blue.jpg'), 
			ambient: 0x808080,
			specular: 0xffffff,
			shininess: 10,
			reflectivity: 5.5 
		});
		
		cubes[i][j] = new THREE.Mesh(geometry, material);
		cubes[i][j].position = new THREE.Vector3(x, y, 0);
		
		scene.add(cubes[i][j]);
		j++;
	}
	i++;
}

// Creates the ambient light in the scene
var light = new THREE.AmbientLight(0x808080);
scene.add(light);

// Creates a direct light in the scene
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

// Creates a point light in the scene
pointLight = new THREE.PointLight(0xffffff, 0.7);
pointLight.position.set(0, -1, -1);
scene.add(pointLight);

// Sets the position of the camera
camera.position.x = 70;
camera.position.y = 80;
camera.position.z = 50;

// Allows you to control the space with the mouse
controls = new THREE.OrbitControls(camera);
controls.addEventListener('change', render);

// This function will make the cubes move following the beat and to render them
var render = function () 
{
	if(typeof array === 'object' && array.length > 0) 
	{
		var k = 0;
		for(var i = 0; i < cubes.length; i++) 
		{
			for(var j = 0; j < cubes[i].length; j++) 
			{
				// Scales the depth of the cubes according to the beat
				scale = (array[k] + boost) / 20;
				cubes[i][j].scale.z = (scale < 1 ? 1 : scale);
				k += (k < array.length ? 1 : 0);
 				
 				// Moves the particles according to the beat
				var amp = (boost / 255)*100;

				particleSystem.position.x = amp;
				particleSystem.position.y = amp;
				particleSystem.position.z = amp;
			}
		}
	}
	requestAnimationFrame(render);
	controls.update();
	renderer.render(scene, camera);
};
render();
renderer.setSize(window.innerWidth, window.innerHeight);

// Will create a random colour for our cubes 
function randomColour() 
{
	var r = (Math.floor(Math.random() * 224) * 65536);
	var g = (Math.floor(Math.random() * 224 * 256));
	var b = (Math.floor(Math.random() * 224));
	return (r + b + g) / 3;
}

// Starts when the vindow has finished loading
window.onload = function() 
{
	// Loads the music
	var req = new XMLHttpRequest();
	req.open("GET", 'music/BornFree.mp3', true);
	// The data will be loaded as an array buffer
	req.responseType = "arraybuffer";
	req.onload = function() 
	{
		// Use the audioContext object to decode the response as audio
		audioContext.decodeAudioData(req.response, function(buffer)
		{

			// Create a source node from the buffer
			source = audioContext.createScriptProcessor(2048, 1, 1);
			source.buffer = buffer;

			src = audioContext.createBufferSource();
			src.buffer = buffer;
			

			// Create fft
			fft = audioContext.createAnalyser();
			fft.smoothingTimeConstant = .5;
			fft.fftSize = samples;
			

			// Coonect them up into a chain
			src.connect(fft);
			fft.connect(audioContext.destination);
			source.connect(audioContext.destination);

			// Start src
			src.start();
			
			// Animate the audio
			source.onaudioprocess = function(e) 
			{
				array = new Uint8Array(fft.frequencyBinCount);

				// Put fft frequencies into data array
				fft.getByteFrequencyData(array);
				for (var i = 0; i < array.length; i++) 
				{
		            boost += array[i];
		        }
		        boost =2 * boost / array.length;
			};
			
		});
	};
	req.send();
}
