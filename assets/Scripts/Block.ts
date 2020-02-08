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

import { GameConfig } from "./GameConfig";

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label;

    tag: number = 0;
    row: number = 0;
    col: number = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.label.fontSize = 60;
        this.setTag(0);
    }

    start() {};

    setTag(toTag:number) {
        this.tag = toTag
        this.updateTag();
    }

    /**
     * 更新标签
     */
    updateTag() {
        var bgColor = GameConfig.colorForTag(this.tag)
        this.node.color = bgColor
        var textColor = GameConfig.textColorForTag(this.tag)
        this.label.node.color = textColor

        var num = Math.pow(GameConfig.cardinality, this.tag + 1)
        this.label.string = num.toString()
    }

    // update (dt) {}
}
