import { _decorator, v2, UITransform, Sprite, Vec3, PhysicsSystem2D, ERaycast2DType, v3, Prefab, RigidBody2D, CircleCollider2D, Contact2DType, IPhysics2DContact, Color } from 'cc';
import { Monster, State } from './Monster';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;


@ccclass('Roller')
export class Roller extends Monster {

    @property
    public canShoot: boolean = false;
    attackRange: number = 200;

    body: CircleCollider2D;
    face: Sprite;

    //roll (attack)
    force = 100;
    rollDuration = 0.1;
    rollSpeed = 75;
    rollTimer = 0;
    collided = true;
    triggered = false;

    onLoad() {
        super.onLoad();
        this.playerCenterOff = v3(this.player.getComponent(UITransform).contentSize.x, this.player.getComponent(UITransform).contentSize.y / 2, 0);
        this.body = this.node.getComponent(CircleCollider2D);
        this.face = this.node.getComponent(Sprite);

        if (this.body) {
            this.body.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    detectedPlayer() {
        if (!super.detectedPlayer()) {
            return false;
        }
        let oriPos = this.node.getWorldPosition().add(this.ownCenterOff);
        let targetPos = oriPos.clone().add(v3(this.attackRange * this.direction , 0 ,0));

        let results = PhysicsSystem2D.instance.raycast(oriPos, targetPos, ERaycast2DType.All);
        if (results) {
            for (let i = 0; i < results.length; i++) {
                let result = results[i];
                let collider = result.collider;

                if (collider.node.name == 'Player') {
                    return true;
                }
            }
        }
        return false;
    }

    attack() {
        super.attack();
        //this.body.sensor = true;
        this.rig.linearVelocity = v2(0, 0);
        this.rollTimer = 0;
        this.face.color = Color.GREEN;
        this.triggered = false;
    }

    endAttack() {
        this.state = State.Idle;
        //this.body.sensor = false;
        this.rig.linearVelocity = v2(0, 0);
        this.cooldown = this.cd;
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
        if (this.state != State.Attack) {
            return;
        }
        //player
        if (object.group == this.power(2, 2)) {
            if (!this.collided) {
                this.collided = true;
                object.node.getComponent(PlayerController).hurt();
                //object.node.getComponent(RigidBody2D).applyForce(v2(0, this.force), v2(this.playerCenterOff.x, this.playerCenterOff.y * -this.direction), true);;
            }
        }
    }

    update(deltaTime: number) {

        super.update(deltaTime);

        if (this.state == State.Attack) {
            this.rollTimer += deltaTime;
            if (this.rollTimer > this.rollDuration * 10) {
                this.endAttack();
            }
            else if (this.rollTimer > this.rollDuration * 9) {
                if (this.triggered == false) {
                    //roll 
                    this.triggered = true;
                    this.collided = false;
                    this.face.color = Color.WHITE;
                    this.rig.linearVelocity = v2(this.rollSpeed * this.direction, 0);
                }
            }
            else if (this.rollTimer > this.rollDuration * 6) {
                this.face.color = Color.RED;
            }
            else if (this.rollTimer > this.rollDuration * 3) {
                this.face.color = Color.YELLOW;
            }
        }
    }
}


