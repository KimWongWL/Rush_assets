import { _decorator, Component, Node, find, Vec3, v3, UITransform} from 'cc';
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

    restTime = 1;
    restTimer = 0;
    cd = 2;
    cooldown = this.cd;
    rayCd = 0.5;
    rayCooldown = this.rayCd;

    ownCenterOff: Vec3 = Vec3.ZERO;
    playerCenterOff: Vec3 = Vec3.ZERO;
    state = State.Idle;

    //stat
    hp = 100;
    attackRange: number = 0;
    direction = 1;  //pointing right

    onLoad() {
        this.ownCenterOff = v3(0, this.node.getComponent(UITransform).contentSize.y / 2, 0);
        this.playerCenterOff = v3(0, this.player.getComponent(UITransform).contentSize.y / 2, 0);
        this.gm = find('Canvas/Game manager').getComponent(GameManager);
    }

    detectedPlayer() {
        //cal distance
        let x = (this.player.position.x + this.playerCenterOff.x) - (this.node.position.x + this.ownCenterOff.x);
        let y = (this.player.position.y + this.playerCenterOff.y) - (this.node.position.y + this.ownCenterOff.y);
        y *= 1.5;   //prevent player out of camera
        let dis = Math.sqrt(x * x + y * y);
        console.log(dis);
        //check if player out of attackRange range
        if (dis > this.attackRange) {
            return false;
        }
        return true;
    }

    public setHP(hp: number) {
        this.hp = hp;
    }

    public hurt(damage: number) {
        this.hp -= damage;
        if (this.hp < 1) {
            //die
            this.node.active = false;
            this.gm.addScore();
        }
    }

    onEnable() {
        this.hp = 100;
        this.state = State.Idle;
    }

    attack() {
        this.state = State.Attack;
    }

    update(deltaTime: number) {
        if (this.rayCooldown > 0) {
            this.rayCooldown -= deltaTime;
        }
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }

        if (this.state == State.Idle) {
            this.restTimer += deltaTime;
            if (this.restTimer > this.restTime) {
                this.restTimer = 0;
                this.state = State.Petrol;
            }
        }
    }
}

