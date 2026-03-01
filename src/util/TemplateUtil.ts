import {TAbstractFile} from 'obsidian';
import ChinaCalendarPlugin from "../main";
import Path from "./Path";


/**
 * 模板工具的基类，用于统一不同模板插件的行为
 */
export default class TemplateUtil {

    public readonly plugin: ChinaCalendarPlugin;

    constructor(plugin: ChinaCalendarPlugin) {
        this.plugin = plugin;
    }

    /**
     * 判断指定的模板插件是否启用了
     */
    public isEnable(): boolean {
        return false;
    }

    /**
     * 获取模板文件夹
     */
    public getTemplateFolder(): Path {
        return new Path("");
    }

    /**
     * 向指定的文件中插入模板
     * @param templateFile
     */
    public insertTemplateImpl(templateFile: TAbstractFile) {

    }

}