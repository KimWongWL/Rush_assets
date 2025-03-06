import { _decorator, Animation, Component, Node, EPhysics2DDrawFlags, Vec3, PhysicsSystem2D, ERaycast2DType, v3, UITransform, Prefab, instantiate, Vec2, Sprite, math, BoxCollider2D, Size } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('Shooter')
export class Shooter extends Component {

    @property
    public animEnd: boolean = false;
    @property
    public canShoot: boolean = false;
    @property({ type: Node })
    public player: Node = null;
    @property({ type: Prefab })
    public ui: Prefab = null;
    bullet: Node = null;
    animation:Animation;
    cooldown = 2;
    cd = 2;
    rayCd = 0.5;
    rayCooldown = 0.5;

    range = 500;
    x = this.range;
    y = this.range;
    xDir = -1;
    yDir = 0;
    path = 0;
    ownCenterOff: Vec3;
    playerCenterOff: Vec3;
    lastPlayerPos: Vec3;

    onLoad() {
        this.animation = this.node.getComponent(Animation);

        this.ownCenterOff = v3(0, this.node.getComponent(UITransform).contentSize.y / 2, 0);
        this.playerCenterOff = v3(0, this.player.getComponent(UITransform).contentSize.y / 2, 0);
        return;

        PhysicsSystem2D.instance.enable = true;
        PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape;

        let targetPos = this.player.getWorldPosition().subtract(v3(10,10,0)) ;
        let oriPos = this.node.getWorldPosition();

        let collider = this.player.addComponent(BoxCollider2D);
        collider.offset = Vec2.ZERO;
        collider.group = 4; //wall  //start from 1
        collider.size = new Size(100,100);  
        collider.friction = 0;
        collider.apply();

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
                ui.setWorldPosition(v3(point.x , point.y , 0));
            }
        }

        const colliderList = PhysicsSystem2D.instance.testAABB(this.player.getComponent(BoxCollider2D).worldAABB);
        console.log(colliderList);
        colliderList.forEach(collider => {
            console.log('ray hit ' + collider.node.name + ' from ' + collider.node.name );
        });
    }

    detectedPlayer() {
        let targetPos = this.player.getWorldPosition().add(this.playerCenterOff)
        let oriPos = this.node.getWorldPosition().add(this.ownCenterOff);

        let results = null;
        if (results) {
            //console.log(results.length);
            for (let i = 0; i < results.length; i++) {
                let result = results[i];
                let collider = result.collider;

                if (collider.node.name == 'Player') {
                    return true;
                }

                //let point = result.point;

                //console.log('ray hit ' + collider.group + ' from ' + collider.node.name + ' at ' + point);

                //let ui = instantiate(this.ui);
                //this.node.addChild(ui);
                //ui.setWorldPosition(v3(point.x, point.y, 0));
                //this.schedule(ui.destroy(), 1);    
            }
        }
        return false;
    }

    walkInSquare() {
        //walk in a square
        //if (0) {
        //    this.x += deltaTime * this.xDir * 250;
        //    this.y += deltaTime * this.yDir * 250;
        //    if (this.x < -this.range || this.x > this.range ||
        //        this.y < -this.range || this.y > this.range) {

        //        if (this.xDir != 0) {
        //            this.x = this.range * this.xDir;
        //        } else {
        //            this.y = this.range * this.yDir;
        //        }

        //        this.path++;
        //        let changeDir = 1;
        //        if (this.path == 2) {
        //            //change direction
        //            this.path = 0;
        //            changeDir = -1;
        //        }

        //        if (this.xDir == 0) {
        //            this.xDir = this.yDir * changeDir;
        //            this.yDir = 0;
        //        } else {
        //            this.yDir = this.xDir * changeDir;
        //            this.xDir = 0;
        //        }
        //    }
        //}
    }

    update(deltaTime: number) {

        if (this.rayCooldown > 0) {
            this.rayCooldown -= deltaTime;
        }
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }

        //do raycast to dectect player
        if (this.rayCooldown <= 0) {
            this.rayCooldown = this.rayCd;
            if (this.detectedPlayer()) {
                this.lastPlayerPos = this.player.position;
                if (this.cooldown <= 0) {
                    this.animation.play('shoot');
                }
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


