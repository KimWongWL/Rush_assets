import { _decorator, Component, Input, input, EventKeyboard, KeyCode, v2, v3, RigidBody2D } from 'cc';
const { ccclass, property } = _decorator;

export const enum  State {
    Idle = 0,
    Walking = 1,
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
    //state: State = State.Idle;
    rig: RigidBody2D = null;
    direction = 1;
    gas = 100;      //for floating
    canJump = true; //state
    jump = false;   //pressing space
    right = false;
    left = false;

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        this.rig = this.node.getComponent(RigidBody2D);
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
            default:
                break;
        }
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
            default:
                break;
        }
    }

    update(deltaTime: number) {
        //set the facing direction
        this.node.setScale(v3(this.direction, this.node.scale.y, this.node.scale.z));

        if (this.rig.linearVelocity.y < 0.01) {
            this.canJump = true;
        }

        let velX = 0;
        if (this.left || this.right) {
            velX = this.direction * this.speed;
        }
        if (this.jump) {
            if (!this.canJump) {
                this.gas -= 10 * deltaTime;
                if (this.rig.linearVelocity.y < 8) {
                    this.rig.applyForce(v2(0, this.jumpForce / 10), v2(0, 0), true);
                }
            }
            else {
                this.canJump = false;
                this.rig.applyForce(v2(0, this.jumpForce), v2(0, 0), true);
            }
        }

        this.rig.linearVelocity = v2(velX, this.rig.linearVelocity.y);
    }
}


