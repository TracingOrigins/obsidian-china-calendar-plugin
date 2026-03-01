import {TAbstractFile, App} from 'obsidian';
import ChinaCalendarPlugin from "../main";
import Path from "./Path";
import TemplateUtil from "./TemplateUtil";

// 定义 Obsidian 内部插件类型
interface InternalPlugins {
	plugins: {
		templates?: {
			instance: {
				options: {
					folder: string;
				};
				insertTemplate: (templateFile: TAbstractFile) => void;
			};
		};
		[key: string]: unknown;
	};
}

interface AppWithInternalPlugins extends App {
	internalPlugins: InternalPlugins;
}

export default class ObsidianTemplateUtil extends TemplateUtil {

	constructor(plugin: ChinaCalendarPlugin) {
		super(plugin);
	}

	public isEnable(): boolean {
		const app = this.plugin.app as AppWithInternalPlugins;
		const pluginList = app.internalPlugins?.plugins;
		if (!pluginList) {
			return false;
		}
		return Object.keys(pluginList).includes("templates");
	}

	public getTemplateFolder(): Path {
		const app = this.plugin.app as AppWithInternalPlugins;
		const templatesPlugin = app.internalPlugins?.plugins?.templates;
		if (!templatesPlugin?.instance?.options?.folder) {
			return new Path("");
		}
		return new Path(templatesPlugin.instance.options.folder);
	}

	public insertTemplateImpl(templateFile: TAbstractFile) {
		const app = this.plugin.app as AppWithInternalPlugins;
		const templatesPlugin = app.internalPlugins?.plugins?.templates;
		if (templatesPlugin?.instance) {
			templatesPlugin.instance.insertTemplate(templateFile);
		}
	}
}