#!/usr/bin/env nodejsscript
/* jshint esversion: 11,-W097, -W040, module: true, node: true, expr: true, undef: true *//* global echo, $, pipe, s, fetch, cyclicLoop */
const url_watch= "https://www.youtube.com/watch?v=";
import { env_names, emoji, data_file } from "./constants.mjs";

const pipeAction= pipe.bind(null, function argsValidate(args){
	args.index= Number(Object.hasOwn(args, "index") ? args.index : 0) - 1;
	return args;
});
$.api("zvedatori")
.version("0.2.0")
.describe([
	"Tento script pomáhá s vybráním Zvědátorských¹ videí v playlistu.",
	"",
	"[1] https://www.youtube.com/@Zvedatori"
])
.command("echo", "Jen vypíše video dle zadaného indexu", { default: true })
	.option("--index, -I", "Pořadí od posledního k nejstaršímu. Indexuje se od 1, `0` = vyber náhodně.")
	.action(pipeAction(({ index })=> chooseVideo(index), echo, $.exit.bind(null, 0) ))
.command("text", "Vypíše příspěvek k videu dle zadaného indexu")
	.option("--index, -I", "Pořadí od posledního k nejstaršímu. Indexuje se od 1, `0` = vyber náhodně.")
	.action(pipeAction(({ index })=> chooseVideo(index), compose, echo, $.exit.bind(null, 0)))
.command("mastodon", "Post to mastodon")
	.option("--url", "instance url (e.g.: `https://mstdn.social`) – required")
	.option("--token", "a token for the mastodon account – required")
	.action(pipeAction(async function mastodon({
		url= $.env[env_names.mastodon.url],
		token= $.env[env_names.mastodon.token]
	}){
		if(!url) $.error(`Can't post without a URL, please use the '--url' option or enviroment variable '${env_names.mastodon.url}'.`);
		if(!token) $.error(`Can't post without a token, please use the '--token' option or enviroment variable '${env_names.mastodon.token}'.`);

		const article= pipe (chooseVideo, compose);
		let status= article(0);
		let res= await post({ url, token, status }).then(res=> res.json());
		echo(res);
		status= article(-6*4);
		res= await post({ url, token, status }).then(res=> res.json());
		echo(res);
		$.exit(0);
	}))
.parse();

async function post(d){
	echo(d);
	return { json(){ return "TBD" } };
}
function compose({ date, title, description, id }){
	const url= url_watch+id;
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

	function parseDescription(candidate, limit){
		let out= [], length= 0;
		for(const line of candidate){
			length+= line.length;
			if(length+2>limit)
				return out.join("\n")+"\n…";
			out.push(line);
		}
		return out.join("\n");
	}
}
function chooseVideo(index){
	const data= s.cat(data_file).xargs(JSON.parse);
	const { length }= data;
	if(index>=length) index= length-1;
	else if(index<0) index= randomNumber(-index, length) - 1;
	return data[index];
}

function randomNumber(min, max){ return Math.floor(Math.random() * (max - min + 1) + min); }
/** @param {Date} d @param {Intl.DateTimeFormatOptions["dateStyle"]} dateStyle @returns {string} */
function dateTo(d, dateStyle){ return d.toLocaleString("cs-CZ", { dateStyle }); }
