import { _decorator, Component, Input, input, Sprite, AudioSource, ProgressBar, EventKeyboard, KeyCode, v2, v3, RigidBody2D, find, Animation, BoxCollider2D, CircleCollider2D, PhysicsSystem2D, Size, ERaycast2DType, Prefab, ParticleSystem2D, Node, math, UITransform, EventMouse, BoxCollider } from 'cc';
//import { GameManager } from './GameManager';
import { Door } from './Door';
//import { Sword } from './Sword';
const { ccclass, property } = _decorator;

export const enum  State {
    Normal = 0,
    Attacking = 2,
    Rolling = 3,
    Dead = 4,
    Invincible = 5,
}

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property({ type: Prefab })
    public ui: Prefab = null;
    @property
    public speed = 20;
    @property
    public jumpForce = 1000;
    //@property({ type: State })
    public state: State = State.Invincible;
    rig: RigidBody2D = null;
    boxCollider: BoxCollider2D = null;
    circleCollider: CircleCollider2D = null;
    headCollider: BoxCollider2D = null;
    footCollider: BoxCollider2D = null;
    //gm: GameManager;
    gasUI: ProgressBar;

    //sword
    sword: Node;
    //swordScript: Sword;
    aura: ParticleSystem2D;
    slash: Animation = null;
    swordCol: BoxCollider2D;

    //move
    direction = 1;
    canJump = true; //state
    jump = false;   //pressing space
    right = false;
    left = false;
    rayCastCD = 0.3;
    rayCastCoolDown = this.rayCastCD;
    playerWidth = 28;

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
    gasRegen = 30;
    gasFillReservation = 1;

    //hp
    maxHP = 3;
    hp = this.maxHP;
    invincibleTime = 0.1;
    invincibleTimer = 0;
    hpUI: Sprite[] = [];
    hurtAudio: AudioSource;

    //attackPoint
    public attackPoint = 50;
    public attackInterval = 0.2;
    public attackRange = 1;
    intervalTimer = 0;
    combo = false;
    swingAudio: AudioSource[] = [];

    onLoad() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_PRESSING, this.onKeyHold, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        this.rig = this.node.getComponent(RigidBody2D);
        this.circleCollider = this.node.getComponent(CircleCollider2D);
        this.oriGrav = this.rig.gravityScale;
        this.playerWidth = this.node.getComponent(UITransform).contentSize.x;
        //this.gm = find('Canvas/Game manager').getComponent(GameManager);
        this.sword = this.node.getChildByName('Sword');
        //this.swordScript = this.sword.getComponent(Sword);
        this.slash = this.sword.getComponent(Animation);
        this.swordCol = this.sword.getComponent(BoxCollider2D);
        this.aura = this.sword.getChildByName('Aura').getComponent(ParticleSystem2D);
        this.slash.on(Animation.EventType.FINISHED, this.slashFinished, this);
        this.gasUI = find('Canvas/Camera/RunTimeUI/Gas').getComponent(ProgressBar);
        let hp_node = find('Canvas/Camera/RunTimeUI/Hp');
        for (let i = 0; i < this.maxHP; i++) {
            this.hpUI[i] = hp_node.getChildByName('Heart-00' + i).getComponent(Sprite);
        }
        let audios = this.node.getComponents(AudioSource);
        this.swingAudio[0] = audios[0];
        this.swingAudio[1] = audios[1];
        this.hurtAudio = audios[2];
        //get the box collider
        {
            let colliders = this.node.getComponents(BoxCollider2D);
            for (let i = 0; i < colliders.length; i++) {
                if (colliders[i].group == this.power(2, 2)) {
                    this.boxCollider = colliders[i];
                }
                if (colliders[i].group == this.power(2,5)) {
                    this.headCollider = colliders[i];
                }
                if (colliders[i].group == this.power(2, 6)) {
                    this.footCollider = colliders[i];
                }
            }

            // why i need to do this much just for a drop of blood
            //colliders.forEach(function (col) {
            //    //console.log(i + ' g ' + col.group)
            //    if (col.group == targetGroup) {
            //        index = i;
            //        //console.log('find it' + i)
            //    }
            //    i++;
            //});
            //if (index != 0) {
            //    console.log(index)
            //    this.headCollider = colliders[index];
            //    console.log(this.headCollider);
            //    this.headCollider.tag = 0;
            //}
        }

        this.initial();
    }

    public initial() {
        this.hp = this.maxHP;
        this.canJump = true; //state
        this.jump = false;   //pressing space
        this.right = false;
        this.left = false;
        this.attackInterval = 0.2;
        this.setAttackPoint(50);
        this.setAttackRange(1);
        this.state = State.Normal;
        this.node.position = v3(0, -300, 0);
    }

    onDestroy() {
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_PRESSING, this.onKeyHold, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    public setAttackPoint(newAP : number) {
        this.attackPoint = newAP;
        //this.swordScript.attackPoint = this.attackPoint;
        this.node.emit('setSwordAttkPt',newAP);
    }

    public setAttackRange(newRange: number) {
        if (newRange > 2.1) {
            return;
        }
        this.attackRange = newRange;
        this.sword.scale = v3(this.direction, newRange, this.sword.scale.z);
    }

    public setAuraGrade(grade: number) {
        if (grade < 1) {
            grade = 1;
        }
        if (grade > 5) {
            grade = 5;
        }
        this.aura.totalParticles = 10 * this.power(1.5, grade);
        this.aura.speed = 25 + 5 * grade;
        this.aura.startSize = 10 + 5 * grade;
    }

    attack() {
        if (this.state == State.Attacking || this.state == State.Rolling || this.intervalTimer < this.attackInterval) {
            return;
        }
        this.state = State.Attacking;
        this.rig.linearVelocity = v2(0, this.rig.linearVelocity.y);
        this.jump = false;
        this.swordCol.enabled = true;
        this.intervalTimer = 0;
        //this.swordScript.resetHitList();
        this.node.emit('resetSwordHitList');
        //console.log(this.combo);
        if (this.combo) {
            this.combo = false;
            //console.log('2');
            this.slash.play('slash2');
            this.swingAudio[1].play();
        }
        else {
            this.combo = true;
            //console.log('1');
            this.slash.play('slash1');
            this.swingAudio[0].play();
        }
    }

    slashFinished(animationName: string, aa: string, aaa: string) {
        if (this.state != State.Rolling) {
            this.state = State.Normal;
        }
        this.intervalTimer = this.attackInterval;
    }

    deactiveBlade() {
        this.intervalTimer = this.attackInterval;
        this.combo = false;
    }

    resetBlade() {
        //console.log('reset');
        this.combo = false;
        this.swordCol.enabled = false;
        this.slash.play('slash2');
    }

    public resetKey() {
        this.right = false;
        this.left = false;
        this.jump = false;
    }

    onMouseDown(event: EventMouse) {
        if (this.state == State.Invincible) {
            return;
        }
        if (event.getButton() == EventMouse.BUTTON_LEFT) {
            this.attack();
        }
    }

    onKeyDown(event: EventKeyboard) {
        if (this.state == State.Invincible) {
            return;
        }
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.direction = -1;
                this.left = true;
                this.right = false;
                break;
            case KeyCode.KEY_D:
                this.direction = 1;
                this.right = true;
                this.left = false;
                break;
            case KeyCode.SPACE:
                this.jump = true;
                break;
            case KeyCode.KEY_S:
                this.fall();
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

    //prevent player stop when attack
    onKeyHold(event: EventKeyboard) {
        if (this.state == State.Invincible) {
            return;
        }
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.direction = -1;
                this.left = true;
                this.right = false;
                break;
            case KeyCode.KEY_D:
                this.direction = 1;
                this.right = true;
                this.left = false;
                break;
            case KeyCode.SPACE:
                break;
            case KeyCode.KEY_S:
                break;
            case KeyCode.SHIFT_LEFT:
                break;
            default:
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (this.state == State.Invincible) {
            return;
        }
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
            case KeyCode.SHIFT_LEFT:
                break;
            default:
                break;
        }
    }

    checkOnGround() {
        let startPosn = this.node.getWorldPosition();
        let endPosn = this.node.getWorldPosition().clone().subtract(v3(0, 10, 0));
        //{
        //    let ui = instantiate(this.ui);
        //    this.node.addChild(ui);
        //    ui.setWorldPosition(startPosn);
        //    ui.getComponent(Sprite).color = math.color(0, 0, 255, 255);
        //}
        //{
        //    let ui = instantiate(this.ui);
        //    this.node.addChild(ui);
        //    ui.setWorldPosition(endPosn);
        //    ui.getComponent(Sprite).color = math.color(255, 0, 0, 255);
        //}

        let results = PhysicsSystem2D.instance.raycast(startPosn, endPosn, ERaycast2DType.Any);
        //console.log('check ground' + results.length);
        if (results && results.length > 0) {
            //for (let i = 0; i < results.length; i++) {
            //    let result = results[i];
            //    let collider = result.collider;
            //    console.log(collider.node.name);
            //}
            //collided
            return true;
        }
        return false;
    }

    fall() {
        for (let j = 0; j < 3; j++) {
            //find oneway wall
            let startPosn = this.node.getWorldPosition().clone().add(v3(this.playerWidth / 1.9 * (j - 1), 4, 0));
            let endPosn = this.node.getWorldPosition().clone().add(v3(this.playerWidth / 1.9 * (j - 1), -10, 0));

            //{
            //    let ui = instantiate(this.ui);
            //    this.node.addChild(ui);
            //    ui.setWorldPosition(startPosn);
            //    ui.getComponent(Sprite).color = math.color(0, 0, 255, 255);
            //    ui.scale.multiplyScalar(0.2);
            //}
            //{
            //    let ui = instantiate(this.ui);
            //    this.node.addChild(ui);
            //    ui.setWorldPosition(endPosn);
            //    ui.getComponent(Sprite).color = math.color(255, 0, 0, 255);
            //    ui.scale.multiplyScalar(0.2);
            //}

            let results = PhysicsSystem2D.instance.raycast(startPosn, endPosn, ERaycast2DType.All);
            //console.log('check ground' + results.length);
            if (results) {
                let canFall = false;
                for (let i = 0; i < results.length; i++) {
                    let result = results[i];
                    let collider = result.collider;

                    //one way wall
                    let name: string = collider.node.name;
                    if (name == 'Wall') {
                        canFall = true;
                        //console.log(collider.node.name);
                        collider.node.getParent().getComponent(Door).disalbeForPlayer();
                    }
                    //else if (name.includes('OneWay')) {
                    //    canFall = true;
                    //    console.log(collider.node.name);
                    //    collider.node.getComponent(Door).disalbeForPlayer();
                    //}

                    //if (collider.node.name == 'Wall') {
                    //    canFall = true;
                    //    console.log(collider.node.getParent().name);
                    //    collider.node.getParent().getComponent(Door).disalbeForPlayer();
                    //}
                }
                if (canFall) {
                    this.headCollider.tag = 0;  // will set back when fall end
                    this.footCollider.tag = 0;  // will set back when fall end

                    this.scheduleOnce(this.resetHeadCollider, 0.25);
                }
            }

        }
    }

    public resetHeadCollider() {
        this.headCollider.tag = 1;
        this.footCollider.tag = 1;
    }

    public hurt() {
        if (this.invincibleTimer < this.invincibleTime) {
            return;
        }
        this.hurtAudio.play();
        this.hp--;
        this.setAuraGrade(1);
        //this.gm.playerHurt();
        this.node.emit('playerHurt');
        for (let i = this.maxHP - 1; i >= 0; i--) {
            if (this.hpUI[i].enabled == true) {
                this.hpUI[i].enabled = false;
                break;
            }
        }
        if (this.hp < 1) {
            //this.gm.gameOver();
            this.node.emit('gameOver');
            this.state = State.Invincible;
        }
        this.invincibleTimer = 0;
    }

    startRoll() {
        this.node.setScale(v3(this.node.scale.x, 0.5, this.node.scale.z));
        this.rig.linearVelocity = v2(this.rollSpeed * this.direction, 0);
        {
            this.boxCollider.group = this.power(2, 8);
            this.boxCollider.size = new Size(this.boxCollider.size.x, this.boxCollider.size.y / 2);
            this.boxCollider.offset.multiplyScalar(0.5);
        }
        this.state = State.Rolling;
        this.rig.gravityScale = 0;
        this.rollCoolDown = this.rollDuration * 2;
        this.slash.play('sword');
        this.deactiveBlade();
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
        //{
        //    this.circleCollider.radius *= 2;
        //    this.circleCollider.offset.multiplyScalar(2);
        //    this.circleCollider.group = this.power(2, 2);
        //}
        this.rig.gravityScale = this.oriGrav;
        this.state = State.Normal;
        this.rollTimer = 0;
    }

    power(num, index) {
        if (index <= 1) {
            return num;
        }
        else {
            return this.power(num, index - 1) * num;
        }
    }

    update(deltaTime: number) {

        //attack
        if (this.intervalTimer < this.attackInterval * 2.5) {
            this.intervalTimer += deltaTime;
            if (this.intervalTimer >= this.attackInterval * 2.5 && this.combo && this.state != State.Attacking) {
                this.resetBlade();
            }
        }

        //hp regen
        if (this.hp < 3) {
            //console.log(this.hp);
            this.hp += deltaTime * 0.1;
            for (let i = 0; this.hp >= i + 1 && i < this.maxHP; i++) {
                //console.log(this.hp);
                this.hpUI[i].enabled = true;
            }
            if (this.hp > 3) {
                this.hp = 3;
            }
        }
        if (this.invincibleTimer < this.invincibleTime) {
            this.invincibleTimer += deltaTime;
        }

        //refill gas
        if (this.gasFillReservation > 0) {
            this.gasFillReservation -= deltaTime;
        }
        if (this.gasFillReservation <= 0) {
            this.gas += this.gasRegen * deltaTime;
            this.gasUI.progress = this.gas / 100;
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
            this.canJump = this.checkOnGround();
        }

        switch (this.state) {
            case State.Normal:
                //set the facing direction
                this.node.setScale(v3(this.direction, this.node.scale.y, this.node.scale.z));
                this.aura.angle = 20 + 110 * this.direction;
                //walk
                let velX = 0;
                if (this.left || this.right) {
                    velX = this.direction * this.speed;
                }
                //jump
                if (this.jump) {
                    //console.log(this.canJump);
                    if (this.canJump) {
                        this.canJump = false;
                        //if only player still on ground, jump
                        if (this.checkOnGround()) {
                            this.rig.applyForce(v2(0, this.jumpForce), v2(0, 0), true);
                            break;
                        }
                    }

                    let gasBurn = this.gasRegen * 2 * deltaTime;
                    if (!this.canJump && this.gas > gasBurn) {
                        this.gas -= gasBurn;
                        this.gasFillReservation = 1;
                        this.gasUI.progress = this.gas / 100;
                        if (this.rig.linearVelocity.y < 8) {
                            this.rig.applyForce(v2(0, this.jumpForce / 5), v2(0, 0), true);
                        }
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
            default:
                break;
        }
    }
}


