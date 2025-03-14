import { _decorator, Animation, Node, find, Vec3, PhysicsSystem2D, ERaycast2DType, v3, Prefab, v2} from 'cc';
import { Bullet } from './Bullet';
import { Monster, State } from './Monster';
const { ccclass, property } = _decorator;


@ccclass('Shooter')
export class Shooter extends Monster {

    @property
    public canShoot: boolean = false;
    attackRange: number = 300;

    animation: Animation;
    bullet: Node;
    bulletScript: Bullet;
    animEnd = true;

    bulletFireOff: Vec3 = Vec3.ZERO;

    //range = 500;
    //x = this.range;
    //y = this.range;
    //xDir = -1;
    //yDir = 0;
    //path = 0;

    onLoad() {
        super.onLoad();
        this.animation = this.node.getComponent(Animation);
        this.bullet = this.node.getChildByName('Bullet');
        this.bulletScript = this.bullet.getComponent(Bullet);
        this.animation.on(Animation.EventType.FINISHED, this.onAnimationFinish, this);
        //PhysicsSystem2D.instance.enable = true;
        //PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape;

        //let targetPos = this.player.getWorldPosition().subtract(v3(10,10,0)) ;
        //let oriPos = this.node.getWorldPosition();

        //let collider = this.player.addComponent(BoxCollider2D);
        //collider.offset = Vec2.ZERO;
        //collider.group = 4; //wall  //start from 1
        //collider.size = new Size(100,100);  
        //collider.friction = 0;
        //collider.apply();

        //{
        //    let ui = instantiate(this.ui);
        //    this.node.addChild(ui);
        //    ui.setWorldPosition(v3(oriPos.x, oriPos.y, 0));
        //    ui.getComponent(Sprite).color = math.color(0, 0, 255, 255);
        //}
        //{
        //    let ui = instantiate(this.ui);
        //    this.node.addChild(ui);
        //    ui.setWorldPosition(v3(targetPos.x, targetPos.y, 0));
        //    ui.getComponent(Sprite).color = math.color(255,0,0,255);
        //}

        //let results = PhysicsSystem2D.instance.raycast(oriPos, targetPos, ERaycast2DType.All);
        //if (results) {
        //    //console.log(results.length);
        //    for (let i = 0; i < results.length; i++) {
        //        let result = results[i];
        //        let collider = result.collider;
        //        let point = result.point;

        //        console.log('ray hit ' + collider.node.name + ' from ' + collider.node.name + ' at ' + point);

        //        let ui = instantiate(this.ui);
        //        this.node.addChild(ui);
        //        ui.setWorldPosition(v3(point.x , point.y , 0));
        //    }
        //}

        //const colliderList = PhysicsSystem2D.instance.testAABB(this.player.getComponent(BoxCollider2D).worldAABB);
        //console.log(colliderList);
        //colliderList.forEach(collider => {
        //    console.log('ray hit ' + collider.node.name + ' from ' + collider.node.name );
        //});
    }

    detectedPlayer() {
        if (!super.detectedPlayer()) {
            return false;
        }
        let targetPos = this.player.getWorldPosition().add(this.playerCenterOff)
        let oriPos = this.node.getWorldPosition().add(this.ownCenterOff);

        let results = PhysicsSystem2D.instance.raycast(oriPos, targetPos, ERaycast2DType.Closest);
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

    onAnimationFinish() {
        this.animEnd = true;
        this.cooldown = this.cd;
        super.state = State.Idle;
    }

    attack() {
        super.attack();
        this.animEnd = false;
        this.animation.play('shoot');
        this.bullet.active = true;
        this.bulletScript.playerPosn = this.player.getWorldPosition();
        this.rig.linearVelocity = v2(0, 0);
    }

    update(deltaTime: number) {

        super.update(deltaTime);

        if (this.state == State.Attack) {
            if (this.detectedPlayer()) {
                this.lastPlayerPos = this.player.position;
            }
            if (this.canShoot) {
                this.canShoot = false;
                this.bulletScript.shoot();
            }
        }

        ////do raycast to dectect player
        //if (this.state == State.Petrol) {
        //    if (this.rayCooldown <= 0) {
        //        this.rayCooldown = this.rayCd;
        //        if (this.detectedPlayer()) {
        //            this.lastPlayerPos = this.player.position;
        //            if (this.cooldown <= 0 && this.animEnd) {
        //                this.attack();
        //            }
        //        }
        //    }
        //}

        //if (this.canShoot) {
        //    this.canShoot = false;
        //    this.bulletScript.shoot();
        //}

        //if (this.canShoot) {
        //    console.log('shoot');
        //    let y = (this.player.getWorldPosition().y - this.bullet.getWorldPosition().y);
        //    let x = (this.player.getWorldPosition().x - this.bullet.getWorldPosition().x);
        //    let angle = Math.atan2(y, x) / Math.PI * 180;
        //    this.bullet.angle = angle;
        //    this.canShoot = false;
        //}
    }
}


