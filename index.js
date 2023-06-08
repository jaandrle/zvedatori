#!/usr/bin/env nodejsscript
/* jshint esversion: 11,-W097, -W040, module: true, node: true, expr: true, undef: true *//* global echo, $, pipe, s, fetch, cyclicLoop */
const id= "UCjCUIQbZi3JSfANE6tyCCog";
let key= "";
const url_api= "https://youtube.googleapis.com/youtube/v3/";
const url_watch= "https://www.youtube.com/watch?v=";
const options_fetch= { headers: { Accept: "application/json" }, compress: true };
const emoji= [ "🧑‍🔬", "🧑🏻‍🔬", "🧑🏼‍🔬", "🧑🏽‍🔬", "🧑🏾‍🔬", "🧑🏿‍🔬", "👨‍🔬", "👨🏻‍🔬", "👨🏼‍🔬", "👨🏽‍🔬", "👨🏾‍🔬", "👨🏿‍🔬", "👩‍🔬", "👩🏻‍🔬", "👩🏼‍🔬", "👩🏽‍🔬", "👩🏾‍🔬", "👩🏿‍🔬" ];
const env_names= {
	mastodon: {
		url: "MASTODON_URL",
		token: "MASTODON_TOKEN"
	}
};

/**
 * ID a počet videí v playlistu
 * @typedef Playlist
 * @type {{ id: string, length: number }}
 * */

(async function main(){
	const video= await fetchVideos(randomNumber(6*4, playlist.length)); //not to repeat last videos too often
	pipe(
		compose,
		echo
	)(video);
	$.exit(0);
});

const pipeAction= pipe.bind(null, function argsValidate(args){
	if(!Object.hasOwn(args, "tokenYT")){
		const env= "TOKEN_YT";
		if(!Object.hasOwn($.env, env))
			return $.error("Token pro YouTube je povinný! Viz parametr `--tokenYT`.");
		args.tokenYT= $.env[env];
	}
	key= args.tokenYT;
	args.index= Number(Object.hasOwn(args, "index") ? args.index : 0) - 1;
	return args;
});
$.api("zvedatori")
.version("0.1.0")
.describe([
	"Tento script pomáhá s vybráním Zvědátorských¹ videí v playlistu.",
	"",
	"[1] https://www.youtube.com/@Zvedatori"
])
.option("--tokenYT, -Y", "Youtube API token – povinný")
.command("echo", "Jen vypíše video dle zadaného indexu", { default: true })
	.option("--index, -I", "Pořadí od posledního k nejstaršímu. Indexuje se od 1, `0` = vyber náhodně.")
	.action(pipeAction(({ index })=> fetchVideos(index).then(pipe( echo, $.exit.bind(null, 0) ))))
.command("text", "Vypíše příspěvek k videu dle zadaného indexu")
	.option("--index, -I", "Pořadí od posledního k nejstaršímu. Indexuje se od 1, `0` = vyber náhodně.")
	.action(pipeAction(({ index })=> fetchVideos(index).then(pipe( compose, echo, $.exit.bind(null, 0) ))))
.command("mastodon", "Post to mastodon")
	.option("--url", "instance url (e.g.: `https://mstdn.social`) – required")
	.option("--tokenM", "a token for the mastodon account – required")
	.action(pipeAction(async function mastodon({
		url= $.env[env_names.mastodon.url],
		tokenM: token= $.env[env_names.mastodon.token]
	}){
		if(!url) $.error(`Can't post without a URL, please use the '--url' option or enviroment variable '${env_names.mastodon.url}'.`);
		if(!token) $.error(`Can't post without a token, please use the '--token' option or enviroment variable '${env_names.mastodon.token}'.`);

		let status= await fetchVideos(0).then(compose);
		let res= await post({ url, token, status }).then(res=> res.json());
		echo(res);
		status= await fetchVideos(-1).then(compose);
		res= await post({ url, token, status }).then(res=> res.json());
		echo(res);
		$.exit(0);
	}))
.parse();

async function post(d){
	echo(d);
	return { json(){ return "TBD" } };
}
function compose({ date, title, description, url }){
	title= emoji[randomNumber(1, emoji.length)-1] + " " + title;
	const d= new Date(date);
	if(dateTo(d, "short")!==dateTo(new Date(), "short"))
		title+= "\n…vyšlo "+dateTo(d, "medium");
	const hashtags= "#věda #zvědátoři";
	const chars_limit= 500 - title.length - url.length - hashtags.length - 5;//5≡reserve
	description= parseDescription(description, chars_limit);

	return [
		title,
		url,
		description,
		hashtags
	].filter(Boolean).join("\n\n");

	function parseDescription(candidate, limit){//TODO try better backup
		const begining= "Zdroje/Inspirováno:\n";
		const backup= "…viz popisek pod videem";
		if(limit < (begining.length+backup.length))
			return;
		let out= "";
		if(candidate.includes("CO BY KDYBY")){
			out= candidate.slice(candidate.lastIndexOf("\nCO BY KDYBY")+1);
			out= out.slice(0, out.indexOf("\n"));
		} else if(candidate.includes("Zdroje")){
			out= begining+
			candidate.slice(candidate.lastIndexOf("\nZdroje")+1).trim()
				.split("\n").slice(1)
				.filter(Boolean).join("\n");
		}
		if(limit < out.length)
			return begining+backup;
		return out;
	}
}
/** @param {string} id_channel @returns {Promise<Playlist>} */
function fetchPlaylist(id_channel){
	const url= url_api+"channels"+params({
		id: id_channel,
		part: [ "statistics", "contentDetails" ],
		key
	});
	return fetch(url, options_fetch)
		.then(response => response.json())
		.then(pipe(
			function isSuccess(res){
				if(!res.code || res.code===200) return res;
				throw new Error(JSON.stringify(res));
			},
			({ items: [ { statistics, contentDetails } ] })=> ({
				id: contentDetails.relatedPlaylists.uploads,
				length: statistics.videoCount
			})
		));
}
/** @param {Playlist} [playlist] @param {number} index @returns {Promise<Object[]>} */
async function fetchVideos(index= 0, playlist){
	if(!playlist)
		playlist= await fetchPlaylist(id);
	const playlistId= playlist.id;
	if(index<0)
		index= randomNumber(6*4, playlist.length);
	else if(index >= playlist.length)
		index= playlist.length-1;
	
	const maxResults= 50;
	let page= 1, pageToken;
	while(page*maxResults <= index){
		const url= url_api+"playlistItems"+params({
			maxResults, playlistId, pageToken, key
		});
		const d= await fetch(url, options_fetch)
			.then(response => response.json());
		pageToken= d.nextPageToken;
		page+= 1;
	}
	index-= (page-1)*maxResults;
	const url= url_api+"playlistItems"+params({
		part: "snippet",
		fields: [ "items.snippet.publishedAt", "items.snippet.title", "items.snippet.description", "items.snippet.resourceId.videoId" ],
		pageToken, maxResults, playlistId, key
	});
	return fetch(url, options_fetch)
		.then(response => response.json())
		.then(pipe(
			({ items })=> items[index].snippet,
			({ publishedAt, title, description, resourceId })=> ({ title, description, date: publishedAt, url: url_watch+resourceId.videoId })
		));
}

function params(o){
	const out= new URLSearchParams();
	Object.entries(o)
		.forEach(([ name, value ])=> typeof value !== "undefined" && out.append(name, value));
	return "?"+out.toString();
}
function randomNumber(min, max){ return Math.floor(Math.random() * (max - min + 1) + min); }
/** @param {Date} d @param {Intl.DateTimeFormatOptions["dateStyle"]} dateStyle @returns {string} */
function dateTo(d, dateStyle){ return d.toLocaleString("cs-CZ", { dateStyle }); }
