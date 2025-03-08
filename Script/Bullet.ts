import { _decorator, Component, Node, IPhysics2DContact, Contact2DType, Vec2, UITransform, RigidBody2D, v2, Vec3, CircleCollider2D, BoxCollider2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {

    public playerPosn: Vec3 = Vec3.ZERO;
    bullet: CircleCollider2D;
    destructTime = 1.5;
    fireTime = 0.5;
    timer = 0;
    fired = false;
    firePosnOff = Vec2.ZERO;
    rig: RigidBody2D;
    speed = 10;

    onLoad() {

        this.bullet = this.node.getComponent(CircleCollider2D);
        //this.firePosnOff = v2(-this.node.getComponent(UITransform).contentSize.x * this.node.scale.x / 2, 0);
        this.rig = this.node.getComponent(RigidBody2D);

        if (this.bullet) {
            this.bullet.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    power(num, index) {
        if (index == 1) {
            return num;
        }
        else {
            return this.power(num, index - 1) * num;
        }
    }

    onBeginContact(self, object, contact: IPhysics2DContact | null) {
        //wall
        console.log('Collision detected!', object.group);
        if (object.group == this.power(2, 1)) {
            console.log('hit wall');
            this.node.active = false;
        }
    }

    onEnable() {
        this.timer = 0;
        this.fired = false;
        this.node.setPosition(0, 38, 0);
        this.rig.linearVelocity = v2(0,0);
    }

    public shoot() {
        this.node.active = true;
        console.log('fire');
        this.fired = true;
        let y = (this.playerPosn.y - this.node.getWorldPosition().y);
        let x = (this.playerPosn.x - this.node.getWorldPosition().x);
        let angle = Math.atan2(y, x) / Math.PI * 180;
        this.node.angle = angle;
        this.rig.linearVelocity = v2(x, y).normalize().multiplyScalar(this.speed);
    }

    update(deltaTime: number) {
        if (this.timer >= this.destructTime) {
            this.node.active = false;
        }
        else {
            this.timer += deltaTime;
        }
    }
}


