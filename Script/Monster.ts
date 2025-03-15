import { _decorator, Component, Node, find, Vec3, v3, UITransform, RigidBody2D, PhysicsSystem2D, ERaycast2DType, math, v2, instantiate, Prefab, Sprite, ProgressBar } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;


export const enum State {
    Idle = 0,
    Petrol = 1,
    Attack = 2,
}

@ccclass('Monster')
export class Monster extends Component {

    @property({ type: Node })
    public player: Node = null;
    gm: GameManager;
    @property({ type: Prefab })
    public ui: Prefab = null;
    hpBar: ProgressBar;

    restTime = 1;
    restTimer = 0;
    cd = 2;
    cooldown = this.cd;
    rayCd = 0.5;
    rayCooldown = this.rayCd;

    ownCenterOff: Vec3 = Vec3.ZERO;
    playerCenterOff: Vec3 = Vec3.ZERO;
    lastPlayerPos: Vec3 = Vec3.ZERO;
    state = State.Idle;
    rig: RigidBody2D;

    //stat
    maxHp = 100;
    hp = 100;
    attackRange: number = 0;
    direction = 1;  //pointing right
    stepSize = 0;
    step = 3;
    changeDirStep = 8;

    onLoad() {
        this.ownCenterOff = v3(0, this.node.getComponent(UITransform).contentSize.y / 2, 0);
        this.playerCenterOff = v3(0, this.player.getComponent(UITransform).contentSize.y / 2, 0);
        this.gm = find('Canvas/Game manager').getComponent(GameManager);
        this.rig = this.node.getComponent(RigidBody2D);
        this.stepSize = this.node.getComponent(UITransform).contentSize.x;
        this.hpBar = this.node.getChildByName('HpBar').getComponent(ProgressBar);
    }

    detectedPlayer() {
        //cal distance
        let x = (this.player.position.x + this.playerCenterOff.x) - (this.node.position.x + this.ownCenterOff.x);
        let y = (this.player.position.y + this.playerCenterOff.y) - (this.node.position.y + this.ownCenterOff.y);
        y *= 1.5;   //prevent player out of camera
        let dis = Math.sqrt(x * x + y * y);
        //console.log(dis);
        //check if player out of attackRange range
        if (dis > this.attackRange) {
            return false;
        }
        return true;
    }

    public setHP(hp: number) {
        this.hp = hp;
        this.maxHp = hp;
        this.hpBar.progress = this.hp / this.maxHp;
    }

    public hurt(damage: number) {
        this.hp -= damage;
        this.hpBar.progress = this.hp / this.maxHp;
        console.log(this.node.name , ' hurt ', damage);
        if (this.hp < 1) {
            //die
            console.log(this.node.name, ' die');
            this.node.active = false;
            this.gm.addScore();
        }
    }

    onEnable() {
        this.hp = 100;
        this.state = State.Idle;
        this.step = 0;
        this.direction = 1;
    }

    attack() {
        this.state = State.Attack;
    } 

    petrol(deltaTime: number) {
        //take a rest?
        if (math.randomRangeInt(0, 5) == 0) {
            this.rig.linearVelocity = v2(0,0);
            this.state = State.Idle;
            return;
        }

        //change direction?
        if (this.step > this.changeDirStep * 2 || (this.step >= this.changeDirStep && math.randomRangeInt(0, 2) == 0)) {
            //console.log('step : ' + this.step + ' direction changed to ', this.direction);
            this.direction *= -1;
            this.step = 0;
            this.rig.linearVelocity = v2(0, 0);
            return;
        }
        this.step++;
        //console.log('step ', this.step, 'rand  ', math.randomRangeInt(0, 2));

        //check if there is a ground
        let oriPos = this.node.getWorldPosition().add(v3(this.stepSize * this.direction, 5 ,0));
        let targetPos = oriPos.clone().subtract(v3(0, 15, 0));

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

        let results = PhysicsSystem2D.instance.raycast(oriPos, targetPos, ERaycast2DType.All);
        if (results) {
            for (let i = 0; i < results.length; i++) {
                let result = results[i];
                let collider = result.collider;
                //console.log('find ', collider.node.name);

                //if there is a wall(ground), walk stepSize until next raycast
                if (collider.group == 2) {
                    this.rig.linearVelocity = v2(this.stepSize * deltaTime * this.rayCd * this.direction);
                    return;
                }
            }
        }
        this.step = this.changeDirStep * 10;  //change direction
    }

    update(deltaTime: number) {
        if (this.rayCooldown > 0) {
            this.rayCooldown -= deltaTime;
        }
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }
        this.node.scale = v3(this.direction, this.node.scale.y, this.node.scale.z);

        if (this.state == State.Idle) {
            this.restTimer += deltaTime;
            if (this.restTimer > this.restTime) {
                this.restTimer = 0;
                this.state = State.Petrol;
            }
        }
        //do raycast to dectect player
        if (this.state == State.Petrol) {
            if (this.rayCooldown <= 0) {
                this.rayCooldown = this.rayCd;
                if (this.detectedPlayer()) {
                    this.lastPlayerPos = this.player.position;
                    if (this.cooldown <= 0) {
                        this.attack();
                    }
                } else {
                    this.petrol(deltaTime);
                }
            }
        }
    }
}


