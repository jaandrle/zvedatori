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
		s.run`git config user.name "Bot"`
		s.run`git config user.email "${"zc.murtnec@naj.elrdna".split("").reverse().join("")}"`
		s.run`git add ${file}`;
		s.run`git commit -m "Updated ${file} by bot – ${des}"`;
		s.run`git push`;
		s.run`git config --remove-section user`
	} else {
		echo("Nothig todo");
	}
}
