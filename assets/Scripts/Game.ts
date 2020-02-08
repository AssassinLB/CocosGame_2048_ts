// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

import { GameConfig } from './GameConfig';

@ccclass
export default class extends cc.Component {

    @property(cc.Prefab)
    bgblockPrefab: cc.Prefab
    @property(cc.Prefab)
    blockPrefab: cc.Prefab

    @property(cc.Node)
    mapBg: cc.Node

    @property(cc.Node)
    showGameOverTipLabel: cc.Node;

    @property(cc.Label)
    scoreLabel: cc.Label
    @property(cc.Label)
    bestScoreLabel: cc.Label

    @property(cc.Node)
    settingDetial:cc.Node;

    score: number = 0
    bestScore: number = 0

    blocks: [any][any];

    blockOriginX: number = 0;
    blockOriginY: number = 0;

    animationDuration: number = 0.3;

    isAnimation: boolean = false;

    checkOpenSetting:boolean = false;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        let storageBestScore = cc.sys.localStorage.getItem('bestScore')
        if (!storageBestScore) {
            storageBestScore = 0
        }
        this.updateBestScore(storageBestScore);

        this.initBlocks();
        this.initMapBackground();
        this.initEventListener();
    }

    start () {
        this.settingDetialEvent();
    }

    /**
     * 初始化主地图数据
     */
    initBlocks() {
        if (GameConfig.order == 3) {
            // MaxScore 1024
            this.blocks = [
                [null, null, null], 
                [null, null, null], 
                [null, null, null]
            ];
        } else if (GameConfig.order == 4) {
            // MaxScore 2048
            this.blocks = [
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null]
            ]
        } else if (GameConfig.order == 5) {
            // MaxScore 8192
            this.blocks = [
                [null, null, null, null, null],
                [null, null, null, null, null],
                [null, null, null, null, null],
                [null, null, null, null, null],
                [null, null, null, null, null]
            ]
        }
    }
    /**
     * 初始化游戏背景, 左下角是起点
     */
    initMapBackground() {
        this.mapBg.color = GameConfig.scoreBoardColor()

        let bgBlockInstance = cc.instantiate(this.bgblockPrefab);
        bgBlockInstance.width = GameConfig.blockWidth;
        bgBlockInstance.height = GameConfig.blockHeigth;

        let rows = GameConfig.getRowCount();
        let cols = GameConfig.getColCount();

        let mapWidth =
            (GameConfig.blockWidth + GameConfig.blockSpace) * rows + GameConfig.blockSpace;
        let mapHeight =
            (GameConfig.blockHeigth + GameConfig.blockSpace) * cols + GameConfig.blockSpace;
        this.mapBg.width = mapWidth;
        this.mapBg.height = mapHeight;
        this.blockOriginX = -1 * (mapWidth - GameConfig.blockWidth) / 2;
        this.blockOriginY = -1 * (mapHeight - GameConfig.blockHeigth) / 2;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let bgBlock = cc.instantiate(this.bgblockPrefab)
                this.setBlockPosition(bgBlock, i, j, false);
                this.mapBg.addChild(bgBlock);
            }
        }

        this.createRandomBlock(false);
    }

    /**
     * 初始化系统事件监听
     */
    initEventListener() {
        this.mapBg.on(
            cc.Node.EventType.TOUCH_START,
            function (event) {
                let location = event.touch.getLocation()
                this.currentMousePositionX = location.x
                this.currentMousePositionY = location.y
            },
            this
        )

        let touchAction = function (event) {
            let location = event.touch.getLocation()
            let xMove = location.x - this.currentMousePositionX
            let yMove = location.y - this.currentMousePositionY
            if (Math.abs(xMove) > Math.abs(yMove)) {
                if (xMove > 0) {
                    this.actionForKeyCode(cc.macro.KEY.right)
                } else {
                    this.actionForKeyCode(cc.macro.KEY.left)
                }
            } else {
                if (yMove > 0) {
                    this.actionForKeyCode(cc.macro.KEY.up)
                } else {
                    this.actionForKeyCode(cc.macro.KEY.down)
                }
            }
        }

        this.mapBg.on(cc.Node.EventType.TOUCH_END, touchAction, this)
        this.mapBg.on(
            cc.Node.EventType.TOUCH_CANCEL,
            touchAction,
            this
        )
    }

    /**
     * 设置方块的位置
     */
    setBlockPosition(tile: any, toRow: number, toCol: number, animated: boolean) {
        let x =
            this.blockOriginX +
            GameConfig.blockSpace +
            toCol * (GameConfig.blockSpace + GameConfig.blockWidth)
        let y =
            this.blockOriginY +
            GameConfig.blockSpace +
            toRow * (GameConfig.blockSpace + GameConfig.blockHeigth)

        if (animated) {
            let moveTo = cc.moveTo(this.animationDuration, cc.v2(x, y))
            tile.runAction(moveTo)
        } else {
            tile.setPosition(x, y)
        }

        tile.row = toRow;
        tile.col = toCol;
    }

    /**
     * 创建随机方块
     */
    createRandomBlock(animated: boolean) {
        let rows = GameConfig.getRowCount()
        let cols = GameConfig.getColCount()
        let nullPositions = []
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (this.blocks[i][j] == null) {
                    nullPositions.push(cc.v2(i, j))
                }
            }
        }
        if (nullPositions.length == 0) {
            return false
        }

        let randomIndex = Math.floor(Math.random() * nullPositions.length)
        let position = nullPositions[randomIndex]

        if (animated) {
            let delayAction = cc.delayTime(this.animationDuration + 0.1)
            let callAction = cc.callFunc(this.createBlockAtPosition, this, position)
            let callFalseAnimationAction = cc.callFunc(this.resetIsAnimation, this)
            let sequenceAction = cc.sequence([
                delayAction,
                callAction,
                callFalseAnimationAction
            ])
            this.node.runAction(sequenceAction)
        } else {
            this.createBlockAtPosition(this.node, position)

            this.resetIsAnimation()
        }

        return true
    }

    /**
     * 在指定位置添加 block
     * @param sender
     * @param position 
     */
    createBlockAtPosition(sender: cc.Node, position: cc.Vec2) {
        let block = cc.instantiate(this.blockPrefab)
        this.blocks[position.x][position.y] = block
        this.setBlockPosition(block, position.x, position.y, false)
        this.mapBg.addChild(block)
    }

    /**
     * 
     */
    resetIsAnimation() {
        this.isAnimation = false
    }

    /**
     * 判断移动的方向
     * @param keyCode 
     */
    actionForKeyCode(keyCode: any) {
        if (this.isAnimation) {
            return
        }

        var isMoved = false
        switch (keyCode) {
            case cc.macro.KEY.up: {
                isMoved = this.moveUp()
                break
            }
            case cc.macro.KEY.down: {
                isMoved = this.moveDown()
                break
            }
            case cc.macro.KEY.left: {
                isMoved = this.moveLeft()
                break
            }
            case cc.macro.KEY.right: {
                isMoved = this.moveRight()
                break
            }
        }

        if (isMoved) {
            this.isAnimation = true

            let isCreated = this.createRandomBlock(true)
            if (!isCreated) {
                this.showGameOverView()
            }
        } else {
            // 检查是否结束
            let isOver = this.checkWhetherOver()
            if (isOver) {
                this.showGameOverView()
            }
        }
    }

    /**
     * 显示游戏结束
     */
    showGameOverView() {
        this.showGameOverTipLabel.active = true;
        this.showGameOverTipLabel.getComponent(cc.Label).string = "Game Over!";
    }

    /**
     * 判断游戏是否结束
     */
    checkWhetherOver() {
        let rows = GameConfig.getRowCount()
        let cols = GameConfig.getColCount()

        let isOver = true
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (this.blocks[i][j] == null) {
                    isOver = false
                    break
                }

                let curTileScript = this.blocks[i][j].getComponent('Block')
                let tagTileScript: any
                let tagi = i + 1
                if (tagi < rows) {
                    if (this.blocks[tagi][j]) {
                        tagTileScript = this.blocks[tagi][j].getComponent('Block')
                        if (tagTileScript.tag == curTileScript.tag) {
                            isOver = false
                            break
                        }
                    }

                }

                let tagj = j + 1
                if (tagj < cols) {
                    if(this.blocks[i][tagj]){
                        tagTileScript = this.blocks[i][tagj].getComponent('Block')
                        if (tagTileScript.tag == curTileScript.tag) {
                            isOver = false
                            break
                        }
                    }
                }
            }
        }

        return isOver
    }

    /**
     * 
     */
    moveUp() {
        let rowsCount = GameConfig.getRowCount()
        let colsCount = GameConfig.getColCount()
        return this.moveVertically(colsCount, rowsCount, fromRow => {
            return rowsCount - 1 - fromRow
        })
    }

    moveDown() {
        let rowsCount = GameConfig.getRowCount()
        let colsCount = GameConfig.getColCount()
        return this.moveVertically(colsCount, rowsCount, fromRow => {
            return fromRow
        })
    }

    moveLeft() {
        let rowsCount = GameConfig.getRowCount()
        let colsCount = GameConfig.getColCount()
        return this.moveHorizontally(rowsCount, colsCount, fromCol => {
            return fromCol
        })
    }

    moveRight() {
        let rowsCount = GameConfig.getRowCount()
        let colsCount = GameConfig.getColCount()
        return this.moveHorizontally(rowsCount, colsCount, fromCol => {
            return colsCount - 1 - fromCol
        })
    }

    moveBlockPosition(tile: any, fromRow: number, fromCol: number, toRow: number, toCol: number) {
        this.blocks[fromRow][fromCol] = null;
        this.blocks[toRow][toCol] = tile;
        this.setBlockPosition(tile, toRow, toCol, true);
    }

    // 竖向
    moveVertically(outerCount: number, innerCount: number, getRealRow: any) {
        let isMoved = false

        for (var col = 0; col < outerCount; col++) {
            // 比较节点
            var tagRow = 0
            var tagTile = this.blocks[getRealRow(tagRow)][col]

            for (var row = 1; row < innerCount; row++) {
                let realRow = getRealRow(row)
                var tile = this.blocks[realRow][col]
                if (tile == null) {
                    continue
                }

                if (tagTile == null) {
                    this.moveBlockPosition(tile, realRow, col, getRealRow(tagRow), col)
                    tagTile = tile
                    isMoved = true
                    continue
                }

                let tagTileScript = tagTile.getComponent('Block')
                let curTileScript = tile.getComponent('Block')
                let tmpRow = getRealRow(tagRow + 1)

                if (tagTileScript.tag != curTileScript.tag) {
                    if (realRow != tmpRow) {
                        this.moveBlockPosition(tile, realRow, col, tmpRow, col)
                        tagRow++
                        isMoved = true
                    } else {
                        tagRow = row
                    }
                    tagTile = tile
                } else {
                    // 加分
                    let addScore = Math.pow(GameConfig.cardinality, curTileScript.tag + 1)
                    this.addScore(addScore)

                    // 移动 block 到最后位置
                    this.moveBlockPosition(tile, realRow, col, tagTile.row, tagTile.col)
                    // 后边继续使用的block 会被 remove
                    this.blocks[tagTile.row][tagTile.col] = tagTile

                    // 合并
                    let delayAction = cc.delayTime(this.animationDuration)
                    let callAction = cc.callFunc(this.updateTag, this, tile)
                    let sequenceAction = cc.sequence([delayAction, callAction])
                    tagTile.runAction(sequenceAction)

                    // 更新比较节点
                    tagRow++
                    tagTile = this.blocks[getRealRow(tagRow)][col]

                    isMoved = true
                }
            }
        }

        return isMoved
    }

    // 横向
    moveHorizontally(outerCount: number, innerCount: number, getRealCol: any) {
        let isMoved = false

        for (var row = 0; row < outerCount; row++) {
            // 比较节点
            var tagCol = 0
            var tagTile = this.blocks[row][getRealCol(tagCol)]

            for (var col = 1; col < innerCount; col++) {
                let realCol = getRealCol(col)
                var tile = this.blocks[row][realCol]
                if (tile == null) {
                    continue
                }

                if (tagTile == null) {
                    this.moveBlockPosition(tile, row, realCol, row, getRealCol(tagCol))
                    tagTile = tile
                    isMoved = true
                    continue
                }

                let tagTileScript = tagTile.getComponent('Block')
                let curTileScript = tile.getComponent('Block')
                let tmpCol = getRealCol(tagCol + 1)

                if (tagTileScript.tag != curTileScript.tag) {
                    if (realCol != tmpCol) {
                        this.moveBlockPosition(tile, row, realCol, row, tmpCol)
                        tagCol++
                        isMoved = true
                    } else {
                        tagCol = col
                    }
                    tagTile = tile
                } else {
                    // 加分
                    let addScore = Math.pow(GameConfig.cardinality, curTileScript.tag + 1)
                    this.addScore(addScore)

                    // 移动 block 到最后位置
                    this.moveBlockPosition(tile, row, realCol, tagTile.row, tagTile.col)
                    // 后边继续使用的是block 会被 remove
                    this.blocks[tagTile.row][tagTile.col] = tagTile

                    // 合并
                    let delayAction = cc.delayTime(this.animationDuration)
                    let callAction = cc.callFunc(this.updateTag, this, tile)
                    let sequenceAction = cc.sequence([delayAction, callAction])
                    tagTile.runAction(sequenceAction)

                    // 更新比较节点
                    tagCol++
                    tagTile = this.blocks[row][getRealCol(tagCol)]
                    isMoved = true
                }
            }
        }

        return isMoved
    }
    
    /**
     * 更新Block的tag
     * @param tile 
     * @param oldTile 
     */
    updateTag(tile: cc.Node, oldTile: any) {
        let tileScript = tile.getComponent('Block')
        tileScript.tag += 1
        tileScript.updateTag()

        oldTile.removeFromParent()
    }

    /**
     * 增加分数
     */
    addScore(add: number) {
        this.score += add

        this.scoreLabel.string = this.score.toString()

        if (this.score > this.bestScore) {
            this.updateBestScore(this.score)
        }
    }

    /**
     * 更新最高分数
     * @param newBestScore 
     */
    updateBestScore(newBestScore: number) {
        this.bestScore = newBestScore
        this.bestScoreLabel.string = this.bestScore.toString()

        cc.sys.localStorage.setItem('bestScore', this.bestScore)
    }

    /**
     * restart 按钮的监听
     */
    restartBtnClick() {

        if (this.showGameOverTipLabel.active) {
            this.showGameOverTipLabel.active = false;
        }

        this.initBlocks();
        this.initMapBackground();

        this.clearScore();
    };

    /**
     * 清空分数
     */
    clearScore() {
        this.score = 0
        this.scoreLabel.string = this.score.toString()
    }

    /**
     * setting 按钮的监听
     */
    settingBtnClick() {
        if(!this.checkOpenSetting){
            this.settingDetial.active = true;
            this.checkOpenSetting = true;
        } else {
            this.settingDetial.active = false;
            this.checkOpenSetting = false;
        }
    };

    /**
     * 设置详情事件
     */
    settingDetialEvent(){
        let content =this.settingDetial.getChildByName("view").getChildByName("content");
        if(content){
            for(let i=0;i<content.childrenCount;i++){
                let children = content.children[i];
                children.getComponent(cc.Button).node.on("click",()=>{
                    GameConfig.order = i + 3;
                    this.clearScore();
                    this.mapBg.removeAllChildren();
                    this.initBlocks();
                    this.initMapBackground();
                })
            }
        }
    }


}
