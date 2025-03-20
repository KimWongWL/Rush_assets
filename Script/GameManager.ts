import { _decorator, Component, Vec3, PhysicsSystem2D, Node, Prefab, instantiate, math, v3, Sprite, Label, find, BoxCollider2D, sys, Color, color, log } from 'cc';
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
    highestHiddenScore = 0;
    scoreLabel: Label;
    public strength = 0;
    strengthIncreaseTimer = -30;
    strengthIncreaseTime = 30;
    strengthLabel: Label;
    monsterPosnList: Node[][] = [[], []];
    areaBlock: BoxCollider2D[][] = [[], []];
    monsterList: Node[][][] = [[], []];
    playerScript: PlayerController;
    scoreGrade: number[] = [10, 20, 40, 70, 100];
    runtimeUI: Node;
    trophyUI: Node;
    trophyUILabels: Label[] = [];
    bloodUI: Sprite;
    gamestartUI: Node;
    gameoverUI: Node;
    gameoverUIScore: Label;
    gameoverUIHidden: Label;
    recordFileName :string =  '/Rush_Record';
    playerDeftAttkStat = [50, 0.2, 1];
    area: string = null;
    //public attackPoint = 50;
    //public attackInterval = 0.2;
    //public attackRange = 1;

    onLoad() {
        this.playerScript = this.player.getComponent(PlayerController);
        this.player.on('playerHurt', this.playerHurt, this);
        this.player.on('gameOver', this.gameOver, this);
        this.scoreLabel = this.scoreUI.getComponent(Label);
        this.scoreLabel.string = 'Score : ' + this.score;
        this.strengthLabel = this.strengthUI.getComponent(Label);
        this.strengthLabel.string = 'MonsterStrength : ' + this.strength;
        this.runtimeUI = find('Canvas/Camera/RunTimeUI');
        this.trophyUI = find('Canvas/Camera/TrophyUI');
        this.trophyUILabels[0] = this.trophyUI.getChildByName('Attack').getChildByName('Cur_Stat').getComponent(Label);
        this.trophyUILabels[1] = this.trophyUI.getChildByName('AttackSpeed').getChildByName('Cur_Stat').getComponent(Label);
        this.trophyUILabels[2] = this.trophyUI.getChildByName('AttackRange').getChildByName('Cur_Stat').getComponent(Label);
        this.bloodUI = find('Canvas/Camera/blood border').getComponent(Sprite);
        console.log(this.bloodUI);
        this.gamestartUI = find('Canvas/Camera/GamestartUI');
        this.gameoverUI = find('Canvas/Camera/GameoverUI');
        this.gameoverUIScore = find('Canvas/Camera/GameoverUI/Bg/Score/Record').getComponent(Label);
        this.gameoverUIHidden = find('Canvas/Camera/GameoverUI/Bg/Hidden Score/Record').getComponent(Label);
        PhysicsSystem2D.instance.enable = true;
        //PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape;
        let castle: Node = this.node.getChildByName('MonsterList_castle');
        this.areaBlock[0] = castle.getComponents(BoxCollider2D);
        let underground: Node = this.node.getChildByName('MonsterList_underground');
        this.areaBlock[1] = underground.getComponents(BoxCollider2D);
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

        //this.gameoverUITitle.string = sys.localStorage.path;
        //console.log(sys.localStorage.path + this.recordFileName);

        this.gamestartUI.active = true;
        this.trophyUI.active = false;
        this.gameoverUI.active = false;
        this.runtimeUI.active = false;
    }

    initial() {
        this.gamestartUI.active = false;
        this.trophyUI.active = false;
        this.gameoverUI.active = false;
        this.runtimeUI.active = true;
        this.killAllMonster('castle');
        this.killAllMonster('underground');
        this.respawnMonster('castle');
        this.respawnMonster('underground');
        this.score = -1;
        this.addScore();
        this.playerHurt();
        this.strength = 0;
        this.strengthIncreaseTimer = -this.strengthIncreaseTime;
        this.bloodUI.color = math.color(255, 255, 255, 0);
    }

    getCurrentTime(): string {
        return new Date().toISOString();
    }

    createAndWriteFile(fileName: string, content: string) {
        // Get the path to the user data directory
        const filePath = `${sys.localStorage.path}/${fileName}`;

        // Write the content to the file
        sys.localStorage.setItem(fileName, content);

        // Log the file path for reference
        console.log(`File created at: ${filePath}`);
    }

    readFile(fileName: string) {
        // Read the content from the file
        const content = sys.localStorage.getItem(fileName);
        if (content) {
            console.log('File contents:', content);
        } else {
            console.log('File not found.');
        }
    }

    restart() {
        this.initial();
        this.playerScript.initial();
    }

    public gameOver() {
        //do somthing
        console.log('gameover');
        this.trophyUI.active = false;
        this.gameoverUI.active = true;
        this.runtimeUI.active = false;
        this.gameoverUIScore.string = '' + this.score;
        this.gameoverUIHidden.string = '' + this.highestHiddenScore;
    }

    public addScore() {
        this.score++;
        this.scoreLabel.string = 'Score : ' + this.score;
        this.hiddenScore++;
        if (this.hiddenScore > this.highestHiddenScore) {
            this.highestHiddenScore = this.hiddenScore;
        }
        for (let i = 0; i < this.scoreGrade.length; i++) {
            if (this.hiddenScore < this.scoreGrade[i]) {
                return;
            }
            if (this.hiddenScore > this.scoreGrade[i]) {
                continue;
            }
            this.hiddenScore = this.scoreGrade[i]
            this.playerScript.setAuraGrade(i + 1);
            return;
        }
    }

    public playerHurt() {
        console.log('nice');
        //console.log(this.bloodUI);
        log(this.node.name);
        log(this.bloodUI);
        this.bloodUI.color = math.color(255, 255, 255, 255);
        this.hiddenScore = 0;
        //this.playerScript.setAuraGrade(1);
    }

    public pickTrophy(name: string) {
        this.killAllMonster(name);
        this.playerScript.state = State.Invincible;
        this.playerScript.resetKey();
        this.area = name;
        this.runtimeUI.active = false;
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
                this.playerScript.setAttackPoint(this.playerScript.attackPoint + this.playerDeftAttkStat[0] * 0.1);
                break;
            case 1:
                this.playerScript.attackInterval = this.playerDeftAttkStat[1] / (this.playerDeftAttkStat[1] / this.playerScript.attackInterval + 0.1) ;
                break;
            case 2:
                this.playerScript.setAttackRange(this.playerScript.attackRange + this.playerDeftAttkStat[2] * 0.1);
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
            //let ts: any;

            if (shooter) {
                //monster = instantiate(this.shooter);
                monster = this.monsterList[index][1][i];
                //ts = monster.getComponent(Shooter);
            }
            else {
                //monster = instantiate(this.roller);
                monster = this.monsterList[index][0][i];
                //ts = monster.getComponent(Roller);
            }

            monster.setPosition(v3(0, 0, 0));
            monster.active = true;
            //ts.setHP(100 * (1 + 0.1 * this.strength));
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
        if (this.bloodUI.color.a > 0) {
            this.bloodUI.color = math.color(255, 255, 255, this.bloodUI.color.a - deltaTime * 500);
        }

        this.strengthIncreaseTimer += deltaTime;
        if (this.strengthIncreaseTimer > this.strengthIncreaseTime) {
            this.strength++;
            this.strengthLabel.string = 'MonsterStrength : ' + this.strength;
            this.strengthIncreaseTimer = 0;
        }
    }
}


