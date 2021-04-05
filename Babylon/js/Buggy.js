export default class Buggy {

    constructor(buggyMesh, speed) {
        this.buggyMesh = buggyMesh;

        if(speed)
            this.speed = speed;
        else
            this.speed = 1;

        // in case, attach the instance to the mesh itself, in case we need to retrieve
        // it after a scene.getMeshByName that would return the Mesh
        // SEE IN RENDER LOOP !
        buggyMesh.Buggy = this;
    }
}