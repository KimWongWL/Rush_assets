import { _decorator, Component, Vec3, PhysicsSystem2D, Node, Prefab, instantiate, math, v3, Sprite, Label, find, BoxCollider2D } from 'cc';
import { Shooter } from './Shooter';
import { Roller } from './Roller';
import { PlayerController, State } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property({ type: Prefab })
    public shooter: Prefab;
    @property({ type: Prefab })
    public roller: Prefab;
    @property({ type: Node })
    public player: Node;
    @property({ type: Node })
    public scoreUI: Node;
    @property({ type: Node })
    public strengthUI: Node;

    score: number = 0;
    hiddenScore = 0;
    scoreLabel: Label;
    strength = 0;
    strengthIncreaseTimer = -30;
    strengthIncreaseTime = 30;
    strengthLabel: Label;
    monsterPosnList: Node[][] = [[], []];
    areaBlock: BoxCollider2D[][] = [[], []];
    monsterList: Node[][][] = [[], []];
    playerScript: PlayerController;
    scoreGrade: number[] = [10, 20, 40, 70, 100];
    trophyUI: Node;
    trophyUILabels: Label[] = [];
    gameoverUI: Node;
    gameoverUITitle: Label;
    gameoverUIRecord: Label;
    recordFileName :string =  'Rush_Record';
    playerDeftAttkStat = [50, 0.2, 1];
    area: string = null;
    //public attackPoint = 50;
    //public attackInterval = 0.2;
    //public attackRange = 1;

    onLoad() {
        this.playerScript = this.player.getComponent(PlayerController);
        this.scoreLabel = this.scoreUI.getComponent(Label);
        this.scoreLabel.string = 'Score : ' + this.score;
        this.strengthLabel = this.strengthUI.getComponent(Label);
        this.strengthLabel.string = 'MonsterStrength : ' + this.strength;
        this.trophyUI = find('Canvas/Camera/TrophyUI');
        this.trophyUILabels[0] = this.trophyUI.getChildByName('Attack').getChildByName('Cur_Stat').getComponent(Label);
        this.trophyUILabels[1] = this.trophyUI.getChildByName('AttackSpeed').getChildByName('Cur_Stat').getComponent(Label);
        this.trophyUILabels[2] = this.trophyUI.getChildByName('AttackRange').getChildByName('Cur_Stat').getComponent(Label);
        this.trophyUI.active = false;
        this.gameoverUI = find('Canvas/Camera/GameoverUI');
        this.gameoverUITitle = this.gameoverUI.getChildByName('Bg').getChildByName('Title').getComponent(Label);
        this.gameoverUIRecord = this.gameoverUI.getChildByName('Bg').getChildByName('Record').getComponent(Label);
        PhysicsSystem2D.instance.enable = true;
        //PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape;
        let castle: Node = this.node.getChildByName('MonsterList_castle');
        this.areaBlock[0] = castle.getComponents(BoxCollider2D);
        console.log(this.areaBlock[0][0]);
        console.log(this.areaBlock[0][1]);
        let underground: Node = this.node.getChildByName('MonsterList_underground');
        this.areaBlock[1] = underground.getComponents(BoxCollider2D);
        console.log(this.areaBlock[1][0]);
        for (let i = 0; i < 10; i++) {
            this.monsterPosnList[0][i] = castle.getChildByName('Node-00' + i);
            this.monsterPosnList[0][i].getComponent(Sprite).enabled = false;
            this.monsterPosnList[1][i] = underground.getChildByName('Node-00' + i);
            this.monsterPosnList[1][i].getComponent(Sprite).enabled = false;
        }
        for (let i = 0; i < 2; i++) {
            this.monsterList[i] = []; // Initialize the second dimension
            for (let j = 0; j < 2; j++) {
                this.monsterList[i][j] = []; // Initialize the third dimension
            }
        }

        this.spawnMonster();
        this.respawnMonster('castle');
        this.respawnMonster('underground');
    }

    getCurrentTime(): string {
        return new Date().toISOString();
    }

    // Function to read a file
    readFile(filePath: string): void {
        readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
            console.log('File contents:', data);
        });
    }

    // Function to write to a file
    writeFile(filePath: string, content: string): void {
        writeFile(filePath, content, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('File written successfully!');
        });
    }

    public gameOver() {
        //do somthing
        console.log('gameover');


    }

    public addScore() {
        this.score++;
        this.scoreLabel.string = 'Score : ' + this.score;
        this.hiddenScore++;
        for (let i = 0; i < this.scoreGrade.length; i++) {
            if (this.hiddenScore < this.scoreGrade[i]) {
                return;
            }
            if (this.hiddenScore > this.scoreGrade[i]) {
                continue;
            }
            //hiddenScore = this.scoreGrade[i]
            this.playerScript.setAuraGrade(i + 1);
            return;
        }
    }

    public playerHurt() {
        this.hiddenScore = 0;
        this.playerScript.setAuraGrade(1);
    }

    public pickTrophy(name: string) {
        this.killAllMonster(name);
        this.playerScript.state = State.Invincible;
        this.playerScript.resetKey();
        this.area = name;
        this.trophyUI.active = true;
        this.trophyUILabels[0].string = 'Current : ' + this.playerScript.attackPoint / this.playerDeftAttkStat[0] * 100 + '%';
        console.log(this.playerScript.attackInterval + " " + this.playerDeftAttkStat[1]);
        let attkSpeed = Math.round(this.playerDeftAttkStat[1] / this.playerScript.attackInterval * 100);
        this.trophyUILabels[1].string = 'Current : ' + attkSpeed + '%';
        this.trophyUILabels[2].string = 'Current : ' + this.playerScript.attackRange / this.playerDeftAttkStat[2] * 100 + '%';
    }

    pick(event: Event, customEventData: string) {
        let index = parseInt(customEventData, 10);
        //console.log(index);
        switch (index) {
            case 0:
                this.playerScript.attackPoint += this.playerDeftAttkStat[0] * 0.1;
                break;
            case 1:
                this.playerScript.attackInterval = this.playerDeftAttkStat[1] / (this.playerDeftAttkStat[1] / this.playerScript.attackInterval + 0.1) ;
                break;
            case 2:
                this.playerScript.attackRange += this.playerDeftAttkStat[2] * 0.1;
                break;
            default:
                break;
        }
        this.trophyUI.active = false;
        this.playerScript.state = State.Normal;
        this.player.setPosition(v3(0,0,0));
        if (this.area) {
            this.killAllMonster(this.area);
            this.scheduleOnce(function () { this.respawnMonster(this.area); }, 10);
        }
    }

    killAllMonster(name: string) {
        let index = -1;
        if (name == 'castle') {
            index = 0;
        }
        else if (name == 'underground') {
            index = 1;
        }

        if (index == -1) {
            return;
        }
        for (let i = 0; i < this.areaBlock[index].length; i++) {
            this.areaBlock[index][i].enabled = true;
        }

        for (let i = 0; i < 10; i++) {

            this.monsterList[index][0][i].active = false;
            this.monsterList[index][1][i].active = false;
        }
    }

    respawnMonster(name: string) {
        let index = -1;
        if (name == 'castle') {
            index = 0;
        }
        else if (name == 'underground') {
            index = 1;
        }
        for (let i = 0; i < this.areaBlock[index].length; i++) {
            this.areaBlock[index][i].enabled = false;
        }

        if (index == -1) {
            console.log('monster spawn place not set');
            return;
        }

        let area = this.node.getChildByName('MonsterList_' + name);
        //console.log(area.name);
        area.getChildByName('Trophy').active = true;
        for (let i = 0; i < 10; i++) {

            let shooter = math.randomRangeInt(0, 2) % 2 == 0;
            if (i == 9) {
                shooter = false;
            }
            let monster: Node;
            let ts: any;

            if (shooter) {
                //monster = instantiate(this.shooter);
                monster = this.monsterList[index][1][i];
                ts = monster.getComponent(Shooter);
            }
            else {
                //monster = instantiate(this.roller);
                monster = this.monsterList[index][0][i];
                ts = monster.getComponent(Roller);
            }

            monster.setPosition(v3(0, 0, 0));
            monster.active = true;
            ts.setHP(100 * (1 + 0.1 * this.strength));
        }
    }

    spawnMonster() {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 10; j++) {
                {
                    let monster = instantiate(this.roller);
                    monster.name = 'Roller-00' + j;

                    this.monsterPosnList[i][j].addChild(monster);
                    monster.setPosition(v3(0, 0, 0));
                    this.monsterList[i][0][j] = monster;
                    monster.active = false;
                }

                {
                    let monster = instantiate(this.shooter);
                    monster.name = 'Shooter-00' + j;

                    this.monsterPosnList[i][j].addChild(monster);
                    monster.setPosition(v3(0, 0, 0));
                    this.monsterList[i][1][j] = monster;
                    monster.active = false;
                }
            }
        }
    }

    update(deltaTime: number) {
        this.strengthIncreaseTimer += deltaTime;
        if (this.strengthIncreaseTimer > this.strengthIncreaseTime) {
            this.strength++;
            this.strengthLabel.string = 'MonsterStrength : ' + this.strength;
            this.strengthIncreaseTimer = 0;
        }
    }
}


