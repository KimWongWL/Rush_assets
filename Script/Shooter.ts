import { _decorator, Animation, Component, Node, Prefab, instantiate, geometry, math, v3, PhysicsSystem } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('Shooter')
export class Shooter extends Component {

    @property({ type: Node })
    public player: Node = null;
    bullet: Node = null;
    animation:Animation;
    cooldown = 2;
    cd = 2;

    @property
    public animEnd: boolean = false;
    @property
    public canShoot: boolean = false;

    ray = new geometry.Ray(0, -1, 0, 0, 1, 0);

    onLoad() {
        this.animation = this.node.getComponent(Animation);
    }

    update(deltaTime: number) {

        let mask = 0xffffffff;
        let maxDistance = 1000;
        let queryTrigger = true;

        let bResult = PhysicsSystem.instance.raycast(this.ray);
        console.log(bResult);
        if (bResult) {
            let results = PhysicsSystem.instance.raycastResults;

            for (let i = 0; i < results.length; i++) {
                let result = results[i];
                let collider = result.collider;
                let distance = result.distance;
                let hitPoint = result.hitPoint;
                let hitNormal = result.hitNormal;

                console.log('ray hit ' + collider + ' from ' + collider.node.name + ' distance ' + distance);
            }
        }

        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
            if (this.cooldown <= 0) {
                this.animation.play('shoot');
            }
        }

        if (this.canShoot) {

            this.canShoot = false;
        }

        if (this.animEnd) {
            this.cooldown = this.cd;
            this.animEnd = false;
        }
    }
}


