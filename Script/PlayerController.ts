import { _decorator, Component, Input, input, EventKeyboard, KeyCode, v2, v3, RigidBody2D, find, Animation, BoxCollider2D, CircleCollider2D, PhysicsSystem2D, Size, ERaycast2DType } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

export const enum  State {
    Normal = 0,
    Attacking = 2,
    Rolling = 3,
    Dead = 4,
}

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property
    public speed = 20;
    @property
    public jumpForce = 1000;
    //@property({ type: State })
    public state: State = State.Normal;
    rig: RigidBody2D = null;
    anim: Animation = null;
    boxCollider: BoxCollider2D = null;
    circleCollider: CircleCollider2D = null;

    //move
    direction = 1;
    canJump = true; //state
    jump = false;   //pressing space
    right = false;
    left = false;
    rayCastCD = 0.5;
    rayCastCoolDown = this.rayCastCD;

    //for roll
    rollTimer = 0;
    rollDistance = 56;
    @property
    public rollSpeed = 56;
    rollDuration = 0.075;
    rollCoolDown = 0;
    oriGrav = 0;

    //gas
    gas = 100;      //for floating
    gasRegen = 20;
    gasFillReservation = 1;

    //hp
    maxHP = 3;
    hp = this.maxHP;

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        this.rig = this.node.getComponent(RigidBody2D);
        //this.anim = this.node.getComponent(Animation);
        //this.anim.on(Animation.EventType.FINISHED, this.onAnimationFinish, this);
        //let colliders = this.node.getComponents(BoxCollider2D);
        //colliders.forEach(function (collider: BoxCollider2D) {
        //    console.log(collider.group + ' box'); 
        //    if (collider.group == 4 /*player*/) {
        //        this.boxCollider = collider;
        //    }
        //});
        this.boxCollider = this.node.getComponent(BoxCollider2D);
        this.circleCollider = this.node.getComponent(CircleCollider2D);
        this.oriGrav = this.rig.gravityScale;

        this.initial();
    }

    initial() {
        this.hp = this.maxHP;
        this.canJump = true; //state
        this.jump = false;   //pressing space
        this.right = false;
        this.left = false;
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.direction = -1;
                this.left = true;
                break;
            case KeyCode.KEY_D:
                this.direction = 1;
                this.right = true;
                break;
            case KeyCode.SPACE:
                this.jump = true;
                break;
            case KeyCode.KEY_S:
                
                break;
            case KeyCode.SHIFT_LEFT:
                if (this.rollCoolDown > 0) {
                    break;
                }
                this.startRoll();
                break;
            default:
                break;
        }
    }

    checkOnGround() {
        let startPosn = this.node.getWorldPosition();
        let endPosn = startPosn.subtract(v3(0, 100, 0));

        let results = PhysicsSystem2D.instance.raycast(startPosn, endPosn, ERaycast2DType.All);
        console.log(results);
        if (results && results.length > 0) {
            console.log(results);
            //collided
            return true;
        }
        return false;
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.left = false;
                break;
            case KeyCode.KEY_D:
                this.right = false;
                break;
            case KeyCode.SPACE:
                this.jump = false;
                break;
            case KeyCode.KEY_S:
                break;
            default:
                break;
        }
    }

    update(deltaTime: number) {

        //refill gas
        if (this.gasFillReservation > 0) {
            this.gasFillReservation -= deltaTime;
        }
        if (this.gasFillReservation <= 0) {
            this.gas += this.gasRegen * deltaTime;
            if (this.gas > 100) {
                this.gas = 100;
            }
        }

        //roll cd
        if (this.rollCoolDown > 0) {
            this.rollCoolDown -= deltaTime;
        }

        //reset can jump state
        if (this.rayCastCoolDown > 0) {
            this.rayCastCoolDown -= deltaTime;
        }
        if (this.rayCastCoolDown <= 0) {
            this.rayCastCoolDown = this.rayCastCD;
            if (this.checkOnGround()) {
                this.canJump = true;
            }
        }

        switch (this.state) {

            case State.Normal:
                //set the facing direction
                this.node.setScale(v3(this.direction, this.node.scale.y, this.node.scale.z));
                //walk
                let velX = 0;
                if (this.left || this.right) {
                    velX = this.direction * this.speed;
                }
                //jump
                if (this.jump) {
                    let gasBurn = this.gasRegen * 5 * deltaTime;
                    if (!this.canJump && this.gas > gasBurn) {
                        this.gas -= gasBurn;
                        this.gasFillReservation = 1;
                        if (this.rig.linearVelocity.y < 8) {
                            this.rig.applyForce(v2(0, this.jumpForce / 10), v2(0, 0), true);
                        }
                    }
                    else if (this.canJump){
                        this.canJump = false;
                        this.rig.applyForce(v2(0, this.jumpForce), v2(0, 0), true);
                    }
                }
                this.rig.linearVelocity = v2(velX, this.rig.linearVelocity.y);
                break;
            case State.Rolling:
                //rolling
                this.rollTimer += deltaTime;
                //console.log(this.rollTimer);
                if (this.rollTimer >= this.rollDuration) {
                    this.endRoll();
                }
                break;
            case State.Normal:
                this.jump = false;
                break;
            case State.Normal:
                break;
            default:
                break;
        }
    }

    public hurt() {
        this.hp -= 1;
        if (this.hp <= 0) {
            let gm: GameManager;
            gm = find('Canvas/Game manager').getComponent(GameManager);
            gm.gameOver();
        }
    }

    startRoll() {
        this.node.setScale(v3(this.node.scale.x, 0.5, this.node.scale.z));
        this.rig.linearVelocity = v2(this.rollSpeed * this.direction, 0);
        //this.boxCollider.enabled = false;
        //this.circleCollider.enabled = false;
        {
            this.boxCollider.group = this.power(2, 8);
            this.boxCollider.size = new Size(this.boxCollider.size.x, this.boxCollider.size.y / 2);
            this.boxCollider.offset.multiplyScalar(0.5);
        }
        {
            this.circleCollider.group = this.power(2, 8);
            this.circleCollider.radius /= 2;
            this.circleCollider.offset.multiplyScalar(0.5);
        }
        this.state = State.Rolling;
        this.rig.gravityScale = 0;
        this.rollCoolDown = this.rollDuration * 2;
    }

    endRoll() {
        this.node.setScale(v3(this.node.scale.x, 1, this.node.scale.z));
        this.rig.linearVelocity = v2(0, 0);
        //this.boxCollider.enabled = true;
        //this.circleCollider.enabled = true;
        {
            this.boxCollider.size = new Size(this.boxCollider.size.x, this.boxCollider.size.y * 2);
            this.boxCollider.offset.multiplyScalar(2);
            this.boxCollider.group = this.power(2, 2);
        }
        {
            this.circleCollider.radius *= 2;
            this.circleCollider.offset.multiplyScalar(2);
            this.circleCollider.group = this.power(2, 2);
        }
        this.rig.gravityScale = this.oriGrav;
        this.state = State.Normal;
        this.rollTimer = 0;
    }

    power(num, index) {
        if (index == 1) {
            return num;
        }
        else {
            return this.power(num, index - 1) * num;
        }
    }
}


