import { _decorator, Animation, Component, Node, find, Vec3, PhysicsSystem2D, ERaycast2DType, v3, UITransform, Prefab, instantiate, Vec2, Sprite, math, BoxCollider2D, Size } from 'cc';
import { Bullet } from './Bullet';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;


export const enum State {
    Idle = 0,
    Petrol = 1,
    Attack = 2,
}

@ccclass('Shooter')
export class Shooter extends Component {

    @property
    public canShoot: boolean = false;
    @property({ type: Node })
    public player: Node = null;
    @property({ type: Prefab })
    public ui: Prefab = null;
    @property
    fireRange: number = 100;

    gm: GameManager;
    animation: Animation;
    bullet: Node;
    bulletScript: Bullet;
    cd = 2;
    cooldown = this.cd;
    rayCd = 0.5;
    rayCooldown = this.rayCd;
    animEnd = true;

    ownCenterOff: Vec3 = Vec3.ZERO;
    playerCenterOff: Vec3 = Vec3.ZERO;
    bulletFireOff: Vec3 = Vec3.ZERO;
    lastPlayerPos: Vec3 = Vec3.ZERO;
    state = State.Idle;

    //hp
    hp = 100;

    //range = 500;
    //x = this.range;
    //y = this.range;
    //xDir = -1;
    //yDir = 0;
    //path = 0;

    onLoad() {
        this.animation = this.node.getComponent(Animation);
        this.bullet = this.node.getChildByName('Bullet');
        this.bulletScript = this.bullet.getComponent(Bullet);

        this.ownCenterOff = v3(0, this.node.getComponent(UITransform).contentSize.y / 2, 0);
        this.animation.on(Animation.EventType.FINISHED, this.onAnimationFinish, this);
        
        this.playerCenterOff = v3(0, this.player.getComponent(UITransform).contentSize.y / 2, 0);
        this.gm = find('Canvas/Game manager').getComponent(GameManager);
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
        let targetPos = this.player.getWorldPosition().add(this.playerCenterOff)
        let oriPos = this.node.getWorldPosition().add(this.ownCenterOff);

        //cal distance
        let x = (this.player.position.x + this.playerCenterOff.x) - (this.node.position.x + this.ownCenterOff.x);
        let y = (this.player.position.y + this.playerCenterOff.y) - (this.node.position.y + this.ownCenterOff.y);
        y *= 1.5;   //prevent player out of camera
        let dis = Math.sqrt(x * x + y * y);
        //check if player out of fire range
        if (dis > this.fireRange) {
            return false;
        }

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

    public setHP(hp : number) {
        this.hp = hp;
    }

    public hurt(damage : number) {
        this.hp -= damage;
        if (this.hp < 1) {
            //die
            this.node.active = false;
            
        }
    }

    onEnable() {
        this.hp = 100;
        this.state = State.Idle;
    }

    onAnimationFinish() {
        this.animEnd = true;
        this.cooldown = this.cd;
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
                //console.log('player dectected');
                this.lastPlayerPos = this.player.position;
                if (this.cooldown <= 0 && this.animEnd) {
                    this.animEnd = false;
                    this.animation.play('shoot');
                    this.bullet.active = true;
                    this.bulletScript.playerPosn = this.player.getWorldPosition();
                }
            }
        }

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

    lateUpdate(deltaTime: number) {
        if(this.canShoot) {
            this.canShoot = false;
            this.bulletScript.shoot();
        }
    }
}


