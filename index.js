#!/usr/bin/env -S npx nodejsscript
/* jshint esversion: 11,-W097, -W040, module: true, node: true, expr: true, undef: true *//* global echo, $, pipe, s, fetch, cyclicLoop */
import { env_names } from "./common.js";
import { post } from './mastodon.js';
const pipeAction= pipe.bind(null, function argsValidate(args){
	const index_index= $.findIndex(a=> [ "--index", "-I" ].includes(a));
	if(index_index !== -1){
		const candidate= $[index_index+1];
		if(/-\d+/.test(candidate))
			args.index= candidate;
	}
	args.index= Number(Object.hasOwn(args, "index") ? args.index : 0) - 1;
	return args;
});
$.api("zvedatori")
.version("0.4.0")
.describe([
	"Tento script pomáhá s vybráním Zvědátorských¹ videí v playlistu.",
	"",
	"[1] https://www.youtube.com/c/Zvedatori"
])
.command("echo", "Jen vypíše video dle zadaného indexu", { default: true })
	.option("--index, -I", "Pořadí od posledního k nejstaršímu. Indexuje se od 1, `0` = vyber náhodně.")
	.action(pipeAction(({ index })=> chooseVideo(index), echo, $.exit.bind(null, 0) ))
.command("text", "Vypíše příspěvek k videu dle zadaného indexu")
	.option("--index, -I", "Pořadí od posledního k nejstaršímu. Indexuje se od 1, `0` = vyber náhodně.")
	.action(pipeAction(({ index })=> chooseVideo(index), compose, echo, $.exit.bind(null, 0)))
.command("mastodon", "Post to mastodon")
	.option("--only", "print last video only if name fits to given argument, also skip posting older")
	.option("--url", "instance url (e.g.: `https://mstdn.social`) – required")
	.option("--token", "a token for the mastodon account – required")
	.example("mastodon --only 'Zpátky mimo téma'")
	.example("mastodon --only 'Zpátky mimo téma' --url URL --token TOKEN")
	.example("mastodon --url URL --token TOKEN")
	.example("mastodon")
	.action(pipeAction(async function mastodon({
		url= $.env[env_names.mastodon.url],
		token= $.env[env_names.mastodon.token],
		only= false
	}){
		if(!url) $.error(`Can't post without a URL, please use the '--url' option or enviroment variable '${env_names.mastodon.url}'.`);
		if(!token) $.error(`Can't post without a token, please use the '--token' option or enviroment variable '${env_names.mastodon.token}'.`);

		const video_choosed= chooseVideo(0);
		if(only && !video_choosed.title.includes(only))
			return $.exit(0);
		
		const getDate= date=> (date ? new Date(date) : new Date()).getDate();
		if(getDate() === getDate(video_choosed.date)){//daily ⇒ no need for proper check
			const res= await post({ url, token, status: compose(video_choosed) });
			echo(res);
		}
		if(only)
			return $.exit(0);
		const status= compose(chooseVideo(-6*4));
		const res= await post({ url, token, status });
		echo(res);
		$.exit(0);
	}))
.parse();

import { emoji } from "./common.js";
function compose({ date, title, description, id }){
	const url= "https://www.youtube.com/watch?v="+id;
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
import { data_file } from "./common.js";
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
