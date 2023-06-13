#!/usr/bin/env -S npx nodejsscript
/* jshint esversion: 11,-W097, -W040, module: true, node: true, expr: true, undef: true *//* global echo, $, pipe, s, fetch, cyclicLoop */
//TODO
import { env_names } from "./common.js";
import { post } from './mastodon.js';
const url_api= "https://www.youtube.com/@Zvedatori/community";

$.api("notifications")
.version("0.1.0")
.describe([
	"Tento script pomáhá s extrahování příspěvků z Komunity¹.",
	"",
	"[1] "+url_api
])
.command("echo", "Jen vypíše přijatá data", { default: true })
	.action(()=> fetchNotifications().then(pipe( echo, $.exit.bind(null, 0) ) ))
.command("text", "Vypíše příspěvek k videu dle zadaného indexu")
	.option("--index, -I", "Vypíše vypraný příspěvek v pořadí od posledního (index= 0 – výchozí).")
	.action(({ index= 0 })=> fetchNotifications().then(pipe( data=> data[index], compose, echo, $.exit.bind(null, 0) )))
.command("mastodon", "Post to mastodon posts for lasts 24hours.")
	.option("--url", "instance url (e.g.: `https://mstdn.social`) – required")
	.option("--token", "a token for the mastodon account – required")
	.option("--old", "limits old of notifications to posts (≤24hours) – defaults to 24")
	.action(async function mastodon({
		url= $.env[env_names.mastodon.url],
		token= $.env[env_names.mastodon.token],
		old= 24
	}){
		const notifications_all= await fetchNotifications();
		const notifications= notifications_all.filter(isFresh.bind(null, old));
		for(const notification of notifications){
			const res= await post({ status: compose(notification), url, token });
			echo(res);
		}
		$.exit(0);
	})
.parse();

function compose({ id, text }){
	const url= "https://www.youtube.com/post/"+id;
	const { length }= text;
	const chars_limit= 500 - url.length - 5;//5≡reserve
	text= text.slice(0, chars_limit);
	if(length - text.length) text+= "…"; //1char
	return [
		"📢 " + text, //2chars
		url
	].join("\n\n"); //1×2chars
}
async function fetchNotifications(){
	const html= await fetch(url_api, { headers: { "Accept-Language": "en" } }).then(res=> res.text());
	const json= html.match(/var ytInitialData = ([^<]*)/)[1].slice(0, -1);
	const { contents }= JSON.parse(json)
		.contents.twoColumnBrowseResultsRenderer.tabs
			.find(tab=> tab.tabRenderer && tab.tabRenderer.selected)
			.tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer;
	return contents
		.filter(o=> Object.hasOwn(o, "backstagePostThreadRenderer"))
		.map(function({ backstagePostThreadRenderer: o }){
			const { postId, contentText, publishedTimeText }= o.post.backstagePostRenderer;
			return {
				id: postId,
				text: pluck(contentText),
				date: pluck(publishedTimeText)
			};
		});

	function pluck(data){ return data.runs.map(t=> t?.text || "").join(""); }
}
function isFresh(limit, { date }){//TODO
	if([ "year", "month", "week", "day" ].find(t=> date.includes(t)))
		return false;
	if(!date.includes("hours")) return true;
	const hours= Number(date.slice(0, date.indexOf(" ")));
	return limit > hours;
}
