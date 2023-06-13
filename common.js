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
		s.run`git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"}`;
		s.run`git config --global user.name "github-actions[bot]"`;
		s.run`git add ${file}`;
		s.run`git commit -m "Updated ${file} by bot – ${des}"`;
		s.run`git push`;
	} else {
		echo("Nothig todo");
	}
}
