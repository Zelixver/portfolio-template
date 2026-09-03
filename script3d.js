// Three.js Scene Setup
let scene, camera, renderer, character, cameraTarget;
let keys = {};
let mouseX = 0, mouseY = 0;
let isJumping = false;
let velocityY = 0;
const gravity = 0.2;

// Character properties
let characterPosition = { x: 0, y: 0, z: 0 };
let characterRotation = { x: 0, y: 0 };
let cameraDistance = 15;
let animationState = 'idle';
let frameCount = 0;
let lastFrameTime = Date.now();
let fps = 0;

/**
 * Initialize the 3D scene
 */
function init() {
    // Setup canvas
    const canvas = document.getElementById('characterCanvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 100, 200);

    // Setup camera
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 15);

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;

    // Add lighting
    setupLighting();

    // Create character
    character = createCharacter();
    scene.add(character);

    // Create environment
    createEnvironment();

    // Setup event listeners
    setupEventListeners();

    // Start animation loop
    animate();
}

/**
 * Setup lighting for the scene
 */
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(20, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);

    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0x00d4ff, 0.5, 100);
    pointLight1.position.set(20, 15, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7b2cbf, 0.5, 100);
    pointLight2.position.set(-20, 15, -20);
    scene.add(pointLight2);
}

/**
 * Create the 3D character
 */
function createCharacter() {
    const characterGroup = new THREE.Group();
    characterGroup.castShadow = true;
    characterGroup.receiveShadow = true;

    // Head
    const headGeometry = new THREE.SphereGeometry(1, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffb366,
        shininess: 100
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 3.5;
    head.castShadow = true;
    head.receiveShadow = true;
    characterGroup.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000,
        shininess: 200
    });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 3.8, 0.8);
    leftEye.castShadow = true;
    characterGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 3.8, 0.8);
    rightEye.castShadow = true;
    characterGroup.add(rightEye);

    // Body
    const bodyGeometry = new THREE.BoxGeometry(1.2, 2, 0.8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00d4ff,
        shininess: 100
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    body.receiveShadow = true;
    characterGroup.add(body);

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);
    const armMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffb366,
        shininess: 100
    });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1, 2.2, 0);
    leftArm.castShadow = true;
    leftArm.receiveShadow = true;
    characterGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1, 2.2, 0);
    rightArm.castShadow = true;
    rightArm.receiveShadow = true;
    characterGroup.add(rightArm);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);
    const legMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x7b2cbf,
        shininess: 100
    });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.4, 0.5, 0);
    leftLeg.castShadow = true;
    leftLeg.receiveShadow = true;
    characterGroup.add(leftLeg);
    leftLeg.userData.isLeg = true;
    leftLeg.userData.side = 'left';

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.4, 0.5, 0);
    rightLeg.castShadow = true;
    rightLeg.receiveShadow = true;
    characterGroup.add(rightLeg);
    rightLeg.userData.isLeg = true;
    rightLeg.userData.side = 'right';

    // Store references for animation
    characterGroup.userData.head = head;
    characterGroup.userData.leftArm = leftArm;
    characterGroup.userData.rightArm = rightArm;
    characterGroup.userData.leftLeg = leftLeg;
    characterGroup.userData.rightLeg = rightLeg;

    return characterGroup;
}

/**
 * Create the environment (ground and sky)
 */
function createEnvironment() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a3a3a,
        shininess: 30
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = -0.5;
    scene.add(ground);

    // Grid helper for better visibility
    const gridHelper = new THREE.GridHelper(200, 40, 0x00d4ff, 0x00d4ff);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Skybox/Environment
    const skyGeometry = new THREE.SphereGeometry(300, 32, 32);
    const skyMaterial = new THREE.MeshPhongMaterial({
        color: 0x0a0a1a,
        emissive: 0x1a1a4a,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
        keys[e.key.toUpperCase()] = true;
        if (e.key === ' ') {
            e.preventDefault();
            jump();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key.toUpperCase()] = false;
    });

    // Mouse movement for camera rotation
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Mouse wheel for zoom
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(5, Math.min(50, cameraDistance));
    }, { passive: false });

    // Window resize
    window.addEventListener('resize', onWindowResize);
}

/**
 * Handle character jump
 */
function jump() {
    if (!isJumping) {
        isJumping = true;
        velocityY = 0.8;
        animationState = 'jump';
    }
}

/**
 * Update character position based on input
 */
function updateCharacterMovement() {
    const moveSpeed = 0.3;
    let isMoving = false;

    // Forward
    if (keys['W']) {
        characterPosition.z -= moveSpeed * Math.cos(characterRotation.y);
        characterPosition.x -= moveSpeed * Math.sin(characterRotation.y);
        isMoving = true;
    }
    // Backward
    if (keys['S']) {
        characterPosition.z += moveSpeed * Math.cos(characterRotation.y);
        characterPosition.x += moveSpeed * Math.sin(characterRotation.y);
        isMoving = true;
    }
    // Left
    if (keys['A']) {
        characterRotation.y += 0.05;
    }
    // Right
    if (keys['D']) {
        characterRotation.y -= 0.05;
    }

    // Jump physics
    if (isJumping) {
        characterPosition.y += velocityY;
        velocityY -= gravity;

        if (characterPosition.y <= 0) {
            characterPosition.y = 0;
            isJumping = false;
            velocityY = 0;
            animationState = isMoving ? 'walk' : 'idle';
        }
    } else {
        animationState = isMoving ? 'walk' : 'idle';
    }

    // Update character position and rotation
    character.position.copy(characterPosition);
    character.rotation.y = characterRotation.y;
}

/**
 * Animate character limbs based on state
 */
function animateCharacter() {
    const time = Date.now() * 0.001;
    const { leftArm, rightArm, leftLeg, rightLeg } = character.userData;

    if (animationState === 'walk') {
        // Walking animation
        const walkSpeed = 0.1;
        leftArm.rotation.z = Math.sin(time * 5) * 0.5;
        rightArm.rotation.z = Math.sin(time * 5 + Math.PI) * 0.5;
        leftLeg.rotation.x = Math.sin(time * 5) * 0.4;
        rightLeg.rotation.x = Math.sin(time * 5 + Math.PI) * 0.4;
    } else if (animationState === 'jump') {
        // Jump animation
        leftArm.rotation.z = -0.5;
        rightArm.rotation.z = 0.5;
        leftLeg.rotation.x = -0.3;
        rightLeg.rotation.x = -0.3;
    } else {
        // Idle animation (slight sway)
        const idleSpeed = 0.02;
        leftArm.rotation.z = Math.sin(time * idleSpeed) * 0.1;
        rightArm.rotation.z = Math.sin(time * idleSpeed + Math.PI) * 0.1;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
    }
}

/**
 * Update camera position to follow character
 */
function updateCamera() {
    const targetX = characterPosition.x + Math.sin(characterRotation.y) * cameraDistance;
    const targetY = characterPosition.y + 5 + Math.sin(Date.now() * 0.0005) * 0.5;
    const targetZ = characterPosition.z + Math.cos(characterRotation.y) * cameraDistance;

    camera.position.lerp(
        new THREE.Vector3(targetX, targetY, targetZ),
        0.1
    );

    // Look at character
    const lookTarget = new THREE.Vector3(
        characterPosition.x,
        characterPosition.y + 2,
        characterPosition.z
    );
    camera.lookAt(lookTarget);
}

/**
 * Update statistics display
 */
function updateStats() {
    document.getElementById('positionX').textContent = `X: ${characterPosition.x.toFixed(2)}`;
    document.getElementById('positionY').textContent = `Y: ${characterPosition.y.toFixed(2)}`;
    document.getElementById('positionZ').textContent = `Z: ${characterPosition.z.toFixed(2)}`;
    
    document.getElementById('rotationX').textContent = `X: ${(characterRotation.x * 180 / Math.PI).toFixed(1)}°`;
    document.getElementById('rotationY').textContent = `Y: ${(characterRotation.y * 180 / Math.PI).toFixed(1)}°`;
    
    const stateDisplay = animationState.charAt(0).toUpperCase() + animationState.slice(1);
    document.getElementById('animationState').textContent = stateDisplay;
    
    document.getElementById('fpsCounter').textContent = Math.round(fps);
}

/**
 * Calculate FPS
 */
function updateFPS() {
    frameCount++;
    const now = Date.now();
    if (now >= lastFrameTime + 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFrameTime = now;
    }
}

/**
 * Handle window resize
 */
function onWindowResize() {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

/**
 * Main animation loop
 */
function animate() {
    requestAnimationFrame(animate);

    updateCharacterMovement();
    animateCharacter();
    updateCamera();
    updateFPS();
    updateStats();

    renderer.render(scene, camera);
}

/**
 * Initialize on page load
 */
window.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('Three.js library not found. Make sure three.min.js is loaded.');
        return;
    }
    init();
});
