import { _decorator, Component, Node, IPhysics2DContact, Contact2DType, Vec2, UITransform, RigidBody2D, v2, Vec3, CircleCollider2D, BoxCollider2D } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {

    public playerPosn: Vec3 = Vec3.ZERO;
    parentRig: RigidBody2D;
    bullet: CircleCollider2D;
    destructTime = 1.5;
    fireTime = 0.5;
    timer = 0;
    fired = false;
    firePosnOff = Vec2.ZERO;
    rig: RigidBody2D;
    speed = 30;

    onLoad() {

        this.bullet = this.node.getComponent(CircleCollider2D);
        //this.firePosnOff = v2(-this.node.getComponent(UITransform).contentSize.x * this.node.scale.x / 2, 0);
        this.rig = this.node.getComponent(RigidBody2D);
        this.parentRig = this.node.getParent().getComponent(RigidBody2D);

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
        if (!this.node.active) {
            return;
        }
        //wall
        // console.log('Collision detected!', object.group);
        if (object.group == this.power(2, 1)) {
            //console.log('hit wall');
            this.selfDestory();
        }
        //player
        if (object.group == this.power(2, 2)) {
            //console.log('hit player');
            object.node.getComponent(PlayerController).hurt();
            this.selfDestory();
        }
    }

    selfDestory() {
        this.node.active = false;
        this.rig.enabledContactListener = false;
    }

    onEnable() {
        this.timer = 0;
        this.fired = false;
        this.node.setPosition(0, 38, 0);
        let vel = this.parentRig.linearVelocity;
        this.rig.linearVelocity = vel;
        this.rig.enabledContactListener = true;
    }

    public shoot() {
        if (this.node.active) {
            return;
        }
        this.node.active = true;
        //console.log('fire');
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


