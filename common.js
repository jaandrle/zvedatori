export const data_file= "data.json";
export const env_names= {
	mastodon: {
		url: "MASTODON_URL",
		token: "MASTODON_TOKEN"
	},
	youtube: {
		token: "YOUTUBE_TOKEN"
	}
};
export const emoji= [
	"🧑‍🔬",
	"🧑🏻‍🔬",
	"🧑🏼‍🔬",
	"🧑🏽‍🔬",
	"🧑🏾‍🔬",
	"🧑🏿‍🔬",
	"👨‍🔬",
	"👨🏻‍🔬",
	"👨🏼‍🔬",
	"👨🏽‍🔬",
	"👨🏾‍🔬",
	"👨🏿‍🔬",
	"👩‍🔬",
	"👩🏻‍🔬",
	"👩🏼‍🔬",
	"👩🏽‍🔬",
	"👩🏾‍🔬",
	"👩🏿‍🔬"
];
export function gitCommit(file, des= "not specified"){
	if(s.run`git diff --numstat`.trim()){
		echo("Diff to save");
		s.run`git add ${file}`;
		s.run`git commit --author="Bot <andrle.jan@centrum.cz>" -m "Updated ${file} by bot – ${des}"`;
		s.run`git push`;
	} else {
		echo("Nothig todo");
	}
}
