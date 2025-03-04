import { _decorator, BoxCollider2D, Component, instantiate, Node, Prefab, RigidBody2D, Size, TiledMap, Vec2, Vec3, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CreateCollider')
export class CreateCollider extends Component {

    @property({ type: Prefab })
    public colliderUI: Prefab = null;
    @property({ type: Prefab })
    public OneWayWall: Prefab = null;

    makeWallColliders() {
        let tiledMap = this.node.getComponent(TiledMap);
        let tileSize = tiledMap.getTileSize();
        let layer = tiledMap.getLayer('wall');
        let layerSize = layer.getLayerSize();
        let scale = 1.01;

        for (let i = 0; i < layerSize.width; i++) {
            for (let j = 0; j < layerSize.height; j++) {
                let tile = layer.getTiledTileAt(i, j, true);

                if (tile.grid != 0) {
                    let rigidBody = tile.node.addComponent(RigidBody2D);
                    rigidBody.type = 0;
                    let collider = tile.node.addComponent(BoxCollider2D);
                    collider.offset = new Vec2(tileSize.width / 2, tileSize.height / 2);
                    collider.size = new Size(tileSize.x * scale, tileSize.y * scale);  
                    collider.group = 2; //wall  //start from 1
                    collider.friction = 0;
                    collider.apply();

                    //show collider
                    let ui = instantiate(this.colliderUI);
                    this.node.addChild(ui);
                    ui.setPosition(tile.node.getPosition());
                    ui.translate(new Vec3(tileSize.width / 2, tileSize.height / 2, 0));
                    ui.scale.multiplyScalar(scale);

                    // make ground collider too
                    if (this.node.name == 'Underground' && j == 10 && i == 0) {
                        for (let k = 1; k < 100; k++) {
                            //show collider
                            let ui = instantiate(this.colliderUI);
                            this.node.addChild(ui);
                            ui.setPosition(tile.node.getPosition());
                            ui.translate(new Vec3(tileSize.width / 2 - tileSize.width * k, tileSize.height / 2, 0));
                            ui.scale.multiplyScalar(scale);

                            let rigidBody = tile.node.addComponent(RigidBody2D);
                            rigidBody.type = 0;
                            let collider = tile.node.addComponent(BoxCollider2D);
                            collider.offset = new Vec2(tileSize.width / 2 - tileSize.width * k, tileSize.height / 2);
                            collider.size = new Size(tileSize.x * scale, tileSize.y * scale);
                            collider.group = 2; //wall  //start from 1
                            collider.friction = 0;
                            collider.apply();
                        }
                    }
                }
                else {
                    tile.node.destroy();
                }
            }
        }
    }

    makeOneWayWall() {
        let tiledMap = this.node.getComponent(TiledMap);
        let tileSize = tiledMap.getTileSize();
        let layer = tiledMap.getLayer('oneway');
        let layerSize = layer.getLayerSize();
        let scale = 1.01;

        for (let i = 0; i < layerSize.width; i++) {
            for (let j = 0; j < layerSize.height; j++) {
                let tile = layer.getTiledTileAt(i, j, true);

                if (tile.grid != 0) {
                    let oneway = instantiate(this.OneWayWall);
                    this.node.addChild(oneway);
                    oneway.setPosition(tile.node.getPosition());
                    //oneway.translate(new Vec3(tileSize.width / 2, tileSize.height / 2, 0));
                    oneway.scale.multiplyScalar(scale);

                    //show ui
                    oneway.getComponent(Sprite).enabled = true;
                    oneway.getComponentInChildren(Sprite).enabled = true;
                }
                else {
                    tile.node.destroy();
                }

            }
        }
    }

    onLoad() {
        this.makeWallColliders();
        this.makeOneWayWall();
    }
}


