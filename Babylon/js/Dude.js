export default class Dude {
    constructor(dudeMesh, id, speed, scaling, scene) {
        this.dudeMesh = dudeMesh;
        this.id = id;
        this.scene = scene;
        this.scaling = scaling;

        if(speed){this.speed = speed;}
        else{this.speed = 1;}
            
        dudeMesh.Dude = this;

        this.dudeMesh.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);

        if (Dude.boundingBoxParameters == undefined) {
            Dude.boundingBoxParameters = this.calculateBoundingBoxParameters();
        }

        this.bounder = this.createBoundingBox();
        this.bounder.dudeMesh = this.dudeMesh;
    }

    move(scene) {
        
        if (!this.bounder){ return;}

        this.dudeMesh.position = new BABYLON.Vector3(this.bounder.position.x,
            this.bounder.position.y, this.bounder.position.z);

        let tank = scene.getMeshByName("heroTank");
        let direction = tank.position.subtract(this.dudeMesh.position);
        let distance = direction.length();
        //console.log(distance);

        let dir = direction.normalize();
        let alpha = Math.atan2(-dir.x, -dir.z);

        this.dudeMesh.rotation.y = alpha;

        // Les dudes ne se déplaceront vers le joueur que si il est dans un rayon de x unités
        // ils sont "dormants" le reste du temps et deviennent des "enemis" quand on les
        if(distance < 5000 && distance > 30) {
            //a.restart();   
            this.bounder.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }
        else {
            //a.pause();
        }   
    }

    calculateBoundingBoxParameters() {
        // Compute BoundingBoxInfo for the Dude, for this we visit all children meshes
        let childrenMeshes = this.dudeMesh.getChildren();
        let bbInfo = this.totalBoundingInfo(childrenMeshes);

        return bbInfo;
    }

    // Taken from BabylonJS Playground example : https://www.babylonjs-playground.com/#QVIDL9#1
    totalBoundingInfo(meshes){
        var boundingInfo = meshes[0].getBoundingInfo();
        var min = boundingInfo.minimum.add(meshes[0].position);
        var max = boundingInfo.maximum.add(meshes[0].position);
        for(var i=1; i<meshes.length; i++){
            boundingInfo = meshes[i].getBoundingInfo();
            min = BABYLON.Vector3.Minimize(min, boundingInfo.minimum.add(meshes[i].position));
            max = BABYLON.Vector3.Maximize(max, boundingInfo.maximum.add(meshes[i].position));
        }
        return new BABYLON.BoundingInfo(min, max);
    }
    
    createBoundingBox() {
        // Create a box as BoundingBox of the Dude
        let bounder = new BABYLON.Mesh.CreateBox("bounder" + (this.id).toString(), 1, this.scene);
        let bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial", this.scene);
        bounderMaterial.alpha = .4;
        bounder.material = bounderMaterial;
        bounder.checkCollisions = true;

        bounder.position = this.dudeMesh.position.clone();

        let bbInfo = Dude.boundingBoxParameters;

        let max = bbInfo.boundingBox.maximum;
        let min = bbInfo.boundingBox.minimum;

        // Not perfect, but kinda of works...
        // Looks like collisions are computed on a box that has half the size... ?
        bounder.scaling.x = (max._x - min._x) * this.scaling;
        bounder.scaling.y = (max._y - min._y) * this.scaling*2;
        bounder.scaling.z = (max._z - min._z) * this.scaling*3;

        bounder.isVisible = false;

        return bounder;
    }
}