import {TAbstractFile, App} from 'obsidian';
import TemplateUtil from "./TemplateUtil";
import DustCalendarPlugin from "../main";
import Path from "./Path";

// 定义 Templater 插件类型
interface TemplaterPlugin {
	settings: {
		templates_folder: string;
	};
	templater: {
		append_template_to_active_file: (templateFile: TAbstractFile) => void;
	};
}

interface Plugins {
	plugins: {
		"templater-obsidian"?: TemplaterPlugin;
		[key: string]: unknown;
	};
}

interface AppWithPlugins extends App {
	plugins: Plugins;
}

export default class TemplaterUtil extends TemplateUtil {
	constructor(plugin: DustCalendarPlugin) {
		super(plugin);
	}

	public isEnable(): boolean {
		const app = this.plugin.app as AppWithPlugins;
		const pluginList = app.plugins?.plugins;
		if (!pluginList) {
			return false;
		}
		return Object.keys(pluginList).includes("templater-obsidian");
	}

	public getTemplateFolder(): Path {
		const app = this.plugin.app as AppWithPlugins;
		const templaterPlugin = app.plugins?.plugins?.["templater-obsidian"];
		if (!templaterPlugin?.settings?.templates_folder) {
			return new Path("");
		}
		return new Path(templaterPlugin.settings.templates_folder);
	}

	public insertTemplateImpl(templateFile: TAbstractFile) {
		const app = this.plugin.app as AppWithPlugins;
		const templaterPlugin = app.plugins?.plugins?.["templater-obsidian"];
		if (templaterPlugin?.templater) {
			templaterPlugin.templater.append_template_to_active_file(templateFile);
		}
	}
}