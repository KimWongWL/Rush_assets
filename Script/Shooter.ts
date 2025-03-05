import { _decorator, Animation, Component, Node, EPhysics2DDrawFlags, v2, PhysicsSystem2D, ERaycast2DType, v3, UITransform, Prefab, instantiate, Vec2, Sprite, math } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('Shooter')
export class Shooter extends Component {

    @property({ type: Node })
    public player: Node = null;
    @property({ type: Prefab })
    public ui: Prefab = null;
    bullet: Node = null;
    animation:Animation;
    cooldown = 2;
    cd = 2;

    range = 500;
    x = this.range;
    y = this.range;
    xDir = -1;
    yDir = 0;
    path = 0;
    offset;

    @property
    public animEnd: boolean = false;
    @property
    public canShoot: boolean = false;

    onLoad() {
        this.animation = this.node.getComponent(Animation);

        PhysicsSystem2D.instance.enable = true;
        PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape;
        this.offset = v2(0, this.node.getComponent(UITransform).contentSize.y / 2);

        //this.x = -500;

        let targetPos = v2(this.node.position.x + this.x, this.node.position.y + this.y);
        let oriPos = v2(this.node.position.x, this.node.position.y);

        this.player.setPosition(v3(targetPos.x, targetPos.y, 0));

        {
            let ui = instantiate(this.ui);
            this.node.addChild(ui);
            ui.setWorldPosition(v3(oriPos.x, oriPos.y, 0));
            ui.getComponent(Sprite).color = math.color(0, 0, 255, 255);
        }
        {
            let ui = instantiate(this.ui);
            this.node.addChild(ui);
            ui.setWorldPosition(v3(targetPos.x, targetPos.y, 0));
            ui.getComponent(Sprite).color = math.color(255,0,0,255);
        }
        console.log(this.node.position);
        console.log(this.node.getWorldPosition());
        console.log(oriPos);
        console.log(targetPos);

        let results = PhysicsSystem2D.instance.raycast(oriPos, targetPos, ERaycast2DType.All);
        if (results) {
            //console.log(results.length);
            for (let i = 0; i < results.length; i++) {
                let result = results[i];
                let collider = result.collider;
                let point = result.point;

                console.log('ray hit ' + collider.node.name + ' from ' + collider.node.name + ' at ' + point);

                let ui = instantiate(this.ui);
                this.node.addChild(ui);
                ui.setWorldPosition(v3(point.x, point.y, 0));
            }
        }
    }

    update(deltaTime: number) {

        return;

        if (1) {
            this.x += deltaTime * this.xDir * 250;
            this.y += deltaTime * this.yDir * 250;
            if (this.x < -this.range || this.x > this.range ||
                this.y < -this.range || this.y > this.range) {

                if (this.xDir != 0) {
                    this.x = this.range * this.xDir;
                } else {
                    this.y = this.range * this.yDir;
                }

                this.path++;
                let changeDir = 1;
                if (this.path == 2) {
                    //change direction
                    this.path = 0;
                    changeDir = -1;
                } 

                if (this.xDir == 0) {
                    this.xDir = this.yDir * changeDir;
                    this.yDir = 0;
                } else {
                    this.yDir = this.xDir * changeDir;
                    this.xDir = 0;
                }
            }
        }


        let targetPos = v2(this.node.position.x + this.x, this.node.position.y + this.y);

        this.player.setPosition(v3(targetPos.x, targetPos.y, 0));

        let results = PhysicsSystem2D.instance.raycast(this.node.position, targetPos, ERaycast2DType.All);
        if (results) {
            //console.log(results.length);
            for (let i = 0; i < results.length; i++) {
                let result = results[i];
                let collider = result.collider;
                let point = result.point;

                console.log('ray hit ' + collider.node.name + ' from ' + collider.node.name + ' at ' + point);
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


