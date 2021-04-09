import Dude from "./Dude.js";

let canvas;
let engine;
let scene;

let inputStates = {};

window.onload = startGame();


setTimeout(() => {
    document.getElementById("LS").style.display = "none";
    console.log("scene is now loaded");
    document.getElementById("myCanvas").style.display = "";
},20000);

function startGame() {
    document.getElementById("myCanvas").style.display = "none";
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene(); 

    createSkybox();
    modifySettings();
    
    scene.enablePhysics();

    let tank = scene.getMeshByName("heroTank");
    // second parameter is the target to follow
    let followCamera = createFollowCamera(scene, tank);
    scene.activeCamera = followCamera;

    engine.runRenderLoop(() => {
        
        let deltaTime = engine.getDeltaTime(); // remind you something ?
        tank.move();
        tank.fireCannonBalls(); // will fire only if space is pressed !
        textDisplay(scene);
        moveOtherDudes();   
        scene.render();
    });
}

function textDisplay(scene){
    var scoreTexture = new BABYLON.DynamicTexture("scoreTexture", 512, scene, true);
    var scoreboard = BABYLON.Mesh.CreatePlane("scoreboard", 20, scene);
    scoreboard.position = new BABYLON.Vector3(10,8,640);
    scoreboard.material = new BABYLON.StandardMaterial("scoradboardMat", scene);
    scoreboard.material.diffuseTexture = scoreTexture;
    scoreTexture.drawText("Salut à toi terrien!", 40, 100,"bold 50px Arial", "white","rgb(173,27,174)",true,true);
    scoreTexture.drawText("    Tu t'es perdu ?", 40, 160,"50px Arial", "white",null,true,true);
    scoreTexture.drawText("Mais d'où vient cet", 40, 240,"50px Arial", "white",null,true,true);
    scoreTexture.drawText("     étrange buit ?", 40, 300,"50px Arial", "white",null,true,true);
    scoreTexture.drawText("  A toi de trouver!", 40, 360,"bold 50px Arial", "white",null,true,true);
    scoreTexture.drawText("   PS : fais attention", 40, 440,"40px Arial", "white",null,true,true);
    
    /*var img = new Image();
    img.src = './images/OtherAssets/Board.png';
    img.onload = function() {
        droreboard.drawImage(this, 0, 0);
        scoreboard.update();
    }*/
    return(scene)
}

function createSkybox(){
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:2000.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("images/Skyboxes/skyboxPurple/skybox2", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    return skybox;
}

function createScene() {
    let scene = new BABYLON.Scene(engine);
    let ground = createGround(scene);
    let freeCamera = createFreeCamera(scene);
   
    let tank = createTank(scene);    

    createLights(scene);
    createHeroDude(scene);
    createBuggy(scene);
    createUfo(scene);
    createSolarSystem(scene);
    createTree(scene);
 
   return scene;
}

function createGround(scene) {
    // Create terrain material
	var terrainMaterial = new BABYLON.TerrainMaterial("terrainMaterial", scene);
    terrainMaterial.allowShaderHotSwapping = false
    terrainMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    terrainMaterial.specularPower = 64;
    // Set the mix texture (represents the RGB values)
    terrainMaterial.mixTexture = new BABYLON.Texture("images/MixMap.png", scene);

    // Diffuse textures following the RGB values of the mix map
    terrainMaterial.diffuseTexture1 = new BABYLON.Texture("images/Ground/sand.jpg", scene);
    terrainMaterial.diffuseTexture2 = new BABYLON.Texture("images/Ground/floor.png", scene);
    terrainMaterial.diffuseTexture3 = new BABYLON.Texture("images/Ground/grass.png", scene);
    
	// Bump textures according to the previously set diffuse textures
    terrainMaterial.bumpTexture1 = new BABYLON.Texture("images/Ground/grassn.png", scene);
    terrainMaterial.bumpTexture2 = new BABYLON.Texture("images/Ground/floor_bump.png", scene);
    terrainMaterial.bumpTexture3 = new BABYLON.Texture("images/Ground/grassn.png", scene);
   
    // Rescale textures according to the terrain
    terrainMaterial.diffuseTexture1.uScale = terrainMaterial.diffuseTexture1.vScale = 10;
    terrainMaterial.diffuseTexture2.uScale = terrainMaterial.diffuseTexture2.vScale = 10;
    terrainMaterial.diffuseTexture3.uScale = terrainMaterial.diffuseTexture3.vScale = 10;
	
	// Ground
	var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "images/HMap.png", 2000, 2000, 100, 0, 100, scene, true);
	ground.position.y = -2.05;
	ground.material = terrainMaterial;
    ground.checkCollisions = true;
    return ground;
}

function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-1, -1, 0), scene);
    light0.intensity = 0.4;

    var spotlight0 = new BABYLON.SpotLight("buggyLight", new BABYLON.Vector3(300, 150, -595), new BABYLON.Vector3(0, -50, 0), Math.PI / 3, 2, scene);
    

    var pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(300, 150, -595), scene);
    pointLight.diffuseColor = new BABYLON.Color3(0.4, 1, 0.4);
    pointLight.specularColor = new BABYLON.Color3.Black;
    pointLight.intensity = 0.7;

}

function createFreeCamera(scene) {
    let camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(20, 70, 20), scene);
    camera.attachControl(canvas);
    camera.checkCollisions = true; 
    camera.applyGravity = true;

    camera.keysUp.push('z'.charCodeAt(0));
    camera.keysDown.push('s'.charCodeAt(0));
    camera.keysLeft.push('q'.charCodeAt(0));
    camera.keysRight.push('d'.charCodeAt(0));
    camera.keysUp.push('Z'.charCodeAt(0));
    camera.keysDown.push('S'.charCodeAt(0));
    camera.keysLeft.push('Q'.charCodeAt(0));
    camera.keysRight.push('D'.charCodeAt(0));

    return camera;
}

function createFollowCamera(scene, target) {

    let camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);

    camera.radius = 80; // how far from the object to follow
	camera.heightOffset = 15; // how high above the object to place the camera
	camera.rotationOffset = 180; // the viewing angle
	camera.cameraAcceleration = .1; // how fast to move
	camera.maxCameraSpeed = 5; // speed limit

    return camera;
}

let zMovement = 5;

function createTank(scene) {
    let tank = new BABYLON.MeshBuilder.CreateBox("heroTank", {height:1, depth:6, width:6}, scene);
    let tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    tank.material = tankMaterial;
    tank.applyGravity = true;

    // By default the box/tank is in 0, 0, 0, let's change that...
    tank.position = new BABYLON.Vector3(10,0,600);
    tank.speed = 3;
    tank.frontVector = new BABYLON.Vector3(0, 0, 1);

    tank.move = () => {
                //tank.position.z += -1; // speed should be in unit/s, and depends on
                                 // deltaTime !

        // if we want to move while taking into account collision detections
        // collision uses by default "ellipsoids"

        let yMovement = 0;
        //console.log(tank.position);

        if (tank.position.y > 2) {
            zMovement = 0;
            yMovement = -2;
        } 
        //tank.moveWithCollisions(new BABYLON.Vector3(0, yMovement, zMovement));

        if(inputStates.up) {
            //tank.moveWithCollisions(new BABYLON.Vector3(0, 0, 1*tank.speed));
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed));
        }    
        if(inputStates.down) {
            //tank.moveWithCollisions(new BABYLON.Vector3(0, 0, -1*tank.speed));
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-tank.speed, -tank.speed, -tank.speed));

        }    
        if(inputStates.left) {
            //tank.moveWithCollisions(new BABYLON.Vector3(-1*tank.speed, 0, 0));
            tank.rotation.y -= 0.02;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));
        }    
        if(inputStates.right) {
            //tank.moveWithCollisions(new BABYLON.Vector3(1*tank.speed, 0, 0));
            tank.rotation.y += 0.02;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));
        }
    }
    // to avoid firing too many cannonball rapidly
    tank.canFireCannonBalls = true;
    tank.fireCannonBallsAfter = 0.1; // in seconds

    tank.fireCannonBalls = function() {

        if(!inputStates.space) return;

        if(!this.canFireCannonBalls) return;

        this.canFireCannonBalls = false;

        setTimeout(() => {
            this.canFireCannonBalls = true;
        }, 1000 * this.fireCannonBallsAfter);

        let cannonball = BABYLON.MeshBuilder.CreateSphere("cannonball", {diameter: 2, segments: 32}, scene);
        cannonball.material = new BABYLON.StandardMaterial("Fire", scene);
        cannonball.material.diffuseTexture = new BABYLON.Texture("images/OtherAssets/Fire.jpg", scene)

        let pos = this.position;
        cannonball.position = new BABYLON.Vector3(pos.x, pos.y+1, pos.z);
        cannonball.position.addInPlace(this.frontVector);
        cannonball.physicsImpostor = new BABYLON.PhysicsImpostor(cannonball,
            BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1 }, scene);    

        let powerOfFire = 100;
        let azimuth = 0.1; 
        let aimForceVector = new BABYLON.Vector3(this.frontVector.x*powerOfFire, (this.frontVector.y+azimuth)*powerOfFire,this.frontVector.z*powerOfFire);
        
        cannonball.physicsImpostor.applyImpulse(aimForceVector,cannonball.getAbsolutePosition());

        cannonball.actionManager = new BABYLON.ActionManager(scene);
        scene.dudes.forEach(dude => {
            cannonball.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                {trigger : BABYLON.ActionManager.OnIntersectionEnterTrigger,
                parameter : dude.Dude.bounder}, 
                () => {
                    dude.Dude.bounder.dispose();
                    dude.dispose();
                    setTimeout(() => {
                        cannonball.dispose();
                    }, 10);
                     // j'ai remarqué que si on fait disparaitre au bout de x temps cela devient plus fluide
                }
            ));
        });

        setTimeout(() => {
            cannonball.dispose();
        }, 1000);
    }

}

function createHeroDude(scene) {
    // load the Dude 3D animated model
    // name, folder, skeleton name 
    BABYLON.SceneLoader.ImportMesh("him", "models/Dude/", "Dude.babylon", scene, (newMeshes, particleSystems, skeletons) => {
        let heroDude = newMeshes[0];
        heroDude.position = new BABYLON.Vector3(-150, -2, 650); // The original dude

        heroDude.name = "heroDude";

        let a = scene.beginAnimation(skeletons[0], 0, 120, true, 1);

        let hero = new Dude(heroDude, -1, 0.5, 0.2, scene);

        scene.dudes = [];
        for (let i = 0; i < 10; i++) {
            scene.dudes[i] = doClone(heroDude, skeletons, i);
            scene.beginAnimation(scene.dudes[i].skeleton, 0, 120, true, 1);

            var temp = new Dude(scene.dudes[i], i, 0.3, 0.2, scene);
        }
        scene.dudes.push(heroDude);

    });
}

function createBuggy(scene) {
    // load the buggy 3D animation model
    BABYLON.SceneLoader.ImportMesh("", "models/Buggy/", "Buggy.gltf", scene, (newMeshes, particleSystems) => {  
        let buggy1 = newMeshes[0];
        buggy1.position = new BABYLON.Vector3(310, 101, -595);
        buggy1.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);
        buggy1.name = "buggy";
        buggy1.rotation.y = Math.PI;
        return buggy1;
    });
}

function createSolarSystem(scene) {
    // load the solar system 3D animation model
    BABYLON.SceneLoader.ImportMesh("", "models/SolarSystem/", "solar_system.glb", scene, (newMeshes) => {  
        let ss = newMeshes[0];
        ss.position = new BABYLON.Vector3(10, 200, 350);
        ss.scaling = new BABYLON.Vector3(150, 150, 150);
        ss.name = "ss";
        ss.emissiveColor = new BABYLON.Color3(155, 0, 0);
        ss.disableLighting = true;
        return ss;
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function createTree(scene){
    // load the trees 3D animation model
    BABYLON.SceneLoader.ImportMesh("", "models/Tree/", "birchTree1.glb", scene, (newMeshes) => {  
        let tree = newMeshes[0];
        tree.position = new BABYLON.Vector3(10, -3, 550);
        tree.scaling = new BABYLON.Vector3(8, 8, 8);
        tree.name = "tree";

        let trees = [];
        trees[0] = tree

        for(let i = 1; i < 58; i++) {
            trees[i] = tree.clone("tree"+i);
            trees[i].position = new BABYLON.Vector3(getRandomInt(1780)-800, -3, getRandomInt(690)+300)
            let size = getRandomInt(5)+6
            trees[i].scaling = new BABYLON.Vector3(size,size,size)
            trees[i].rotation.y = (Math.PI/2)*getRandomInt(4);
        }
        for(let i = 58; i < 68; i++) {
            trees[i] = tree.clone("tree"+i);
            trees[i].position = new BABYLON.Vector3(getRandomInt(295)+700, -3, getRandomInt(270)+30)
            let size = getRandomInt(5)+6
            trees[i].scaling = new BABYLON.Vector3(size,size,size)
        }
    });

    let cactus = [];

    BABYLON.SceneLoader.ImportMesh("", "models/Tree/", "cactusFleur1.glb", scene, (newMeshes) => {  
        let cactusFleur1 = newMeshes[0];
        cactusFleur1.position = new BABYLON.Vector3(0, 95, -550);
        cactusFleur1.scaling = new BABYLON.Vector3(8, 8, 8);
        cactusFleur1.name = "cactusFleur10";

        cactus[0] = cactusFleur1

        for(let i = 1; i < 7; i++) {
            cactus[i] = cactusFleur1.clone("cactusFleur1"+i);
            cactus[i].position = new BABYLON.Vector3(getRandomInt(450)-10, 96, getRandomInt(480)-760)
            let size = getRandomInt(5)+6
            cactus[i].scaling = new BABYLON.Vector3(size,size,size)
            cactus[i].rotation.y = (Math.PI/2)*getRandomInt(4);
        }
    }); 
    
    BABYLON.SceneLoader.ImportMesh("", "models/Tree/", "cactus.glb", scene, (newMeshes) => {  
        let cactus = newMeshes[0];
        cactus.position = new BABYLON.Vector3(10, 95, -540);
        cactus.scaling = new BABYLON.Vector3(8, 8, 8);
        cactus.name = "cactus0";

        cactus[7] = cactus

        for(let i = 8; i < 12; i++) {
            cactus[i] = cactus.clone("cactus"+i);
            cactus[i].position = new BABYLON.Vector3(getRandomInt(450)-10, 96, getRandomInt(480)-760)
            let size = getRandomInt(5)+6
            cactus[i].scaling = new BABYLON.Vector3(size,size,size)
            cactus[i].rotation.y = (Math.PI/2)*getRandomInt(4);
        }
    }); 

    BABYLON.SceneLoader.ImportMesh("", "models/Tree/", "cactusFleur2.glb", scene, (newMeshes) => {  
        let cactusFleur2 = newMeshes[0];
        cactusFleur2.position = new BABYLON.Vector3(20, 95, -540);
        cactusFleur2.scaling = new BABYLON.Vector3(8, 8, 8);
        cactusFleur2.name = "cactusFleur20";      

        cactus[12] = cactusFleur2

        for(let i = 13; i < 18; i++) {
            cactus[i] = cactusFleur2.clone("cactusFleur2"+i);
            cactus[i].position = new BABYLON.Vector3(getRandomInt(450)-10, 96, getRandomInt(480)-760)
            let size = getRandomInt(5)+6
            cactus[i].scaling = new BABYLON.Vector3(size,size,size)
            cactus[i].rotation.y = (Math.PI/2)*getRandomInt(4);
        }
    });        
    
}

function createUfo(scene){
    // load the Ufo 3D animation model
    BABYLON.SceneLoader.ImportMesh("", "models/UFO/", "ufo.glb", scene, (newMeshes,particleSystems, skeletons) => {  
        let ufo1 = newMeshes[0];
        ufo1.position = new BABYLON.Vector3(300, 101, -595);
        ufo1.scaling = new BABYLON.Vector3(100, 100, 100);
        ufo1.name = "ufo";
        let a = scene.beginAnimation(skeletons[0], 0, 120, true, 1);
    });

}

function doClone(originalMesh, skeletons, id) {
    let myClone = originalMesh.clone("clone_" + id);
    myClone.position = new BABYLON.Vector3(getRandomInt(1780)-800, -2, getRandomInt(690)+300);

    if(!skeletons) return myClone;

    // The mesh has at least one skeleton
    if(!originalMesh.getChildren()) {
        myClone.skeleton = skeletons[0].clone("clone_" + id + "_skeleton");
        return myClone;
    } else {
        if(skeletons.length === 1) {
            // the skeleton controls/animates all children, like in the Dude model
            let clonedSkeleton = skeletons[0].clone("clone_" + id + "_skeleton");
            myClone.skeleton = clonedSkeleton;
            let nbChildren = myClone.getChildren().length;

            for(let i = 0; i < nbChildren;  i++) {
                myClone.getChildren()[i].skeleton = clonedSkeleton
            }
            return myClone;
        } else if(skeletons.length === originalMesh.getChildren().length) {
            // each child has its own skeleton
            for(let i = 0; i < myClone.getChildren().length;  i++) {
                myClone.getChildren()[i].skeleton() = skeletons[i].clone("clone_" + id + "_skeleton_" + i);
            }
            return myClone;
        }
    }

    return myClone;
}

function moveOtherDudes() {
    if(scene.dudes) {
        for(var i = 0 ; i < scene.dudes.length ; i++) {
            scene.dudes[i].Dude.move(scene);
        }
    }    
}

window.addEventListener("resize", () => {
    engine.resize()
});

function modifySettings() {
    // as soon as we click on the game window, the mouse pointer is "locked"
    // you will have to press ESC to unlock it
    scene.onPointerDown = () => {
        if(!scene.alreadyLocked) {
            console.log("requesting pointer lock");
            canvas.requestPointerLock();
        } else {
            console.log("Pointer already locked");
        }
    }

    document.addEventListener("pointerlockchange", () => {
        let element = document.pointerLockElement || null;
        if(element) {
            // lets create a custom attribute
            scene.alreadyLocked = true;
        } else {
            scene.alreadyLocked = false;
        }
    })

    // key listeners for the tank
    inputStates.left = false;
    inputStates.right = false;
    inputStates.up = false;
    inputStates.down = false;
    inputStates.space = false;
    
    //add the listener to the main, window object, and update the states
    window.addEventListener('keydown', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
           inputStates.left = true;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
           inputStates.up = true;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
           inputStates.right = true;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
           inputStates.down = true;
        }  else if (event.key === " ") {
           inputStates.space = true;
        } else if ((event.key === "l") || (event.key === "L")) {
            inputStates.laser = true;
         }
    }, false);

    //if the key will be released, change the states object 
    window.addEventListener('keyup', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
           inputStates.left = false;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
           inputStates.up = false;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
           inputStates.right = false;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
           inputStates.down = false;
        }  else if (event.key === " ") {
           inputStates.space = false;
        } else if ((event.key === "l") || (event.key === "L")) {
            inputStates.laser = false;
         }
    }, false);
}

