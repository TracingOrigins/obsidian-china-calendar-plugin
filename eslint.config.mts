import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";

export default tseslint.config(
	{
		ignores: [
			"node_modules/**",
			"dist/**",
			"esbuild.config.mjs",
			"eslint.config.js",
			"version-bump.mjs",
			"versions.json",
			"main.js",
			"scripts/**",
		],
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						'eslint.config.js',
						'manifest.json',
						'scripts/copy-to-vault.js',
					]
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.json']
			},
		},
	},
	...obsidianmd.configs.recommended,
	{
		files: ["package.json"],
		rules: {
			"depend/ban-dependencies": "off",
		},
	},
);
