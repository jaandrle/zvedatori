#!/usr/bin/env nodejsscript
/* jshint esversion: 11,-W097, -W040, module: true, node: true, expr: true, undef: true *//* global echo, $, pipe, s, fetch, cyclicLoop */
import { data_file, gitCommit } from './common.js';
const url_api= "https://anchor.fm/s/3d2c64f0/podcast/rss";

if($.isMain(import.meta))
	main().then($.exit.bind(null, 0));

export async function main(){
	const { items }= await getItems(url_api);
	pipe(
		f=> s.cat(f).xargs(JSON.parse),
		d=> d.map(v=> ({ ...v, audio: hasAudio(items, v) })),
		d=> JSON.stringify(d, null, "\t"),
		d=> s.echo(d).to(data_file)
	)(data_file);
	return gitCommit(data_file, "podcast");
}
export async function getItems(url){
	const rss= await fetch(url).then(res=> res.text());
	if(!rss || typeof rss!=="string") return {};
	const b= "(.|\\n)*?";//between
	const tag= name=> `<${name}>(<!\\[CDATA\\[)?(?<${name}>.*?)(]]>)?<\\/${name}>`;
	const { link, lastBuildDate }= matchGroups(new RegExp(`${tag("link")}${b}${tag("lastBuildDate")}`), rss);
	const links= { podcast: link, episodes: link+"/episodes/" };
	const item_regexp= new RegExp(`${tag("title")}${b}${tag("link")}`);
	const missed= { patterns: new Set(), links: new Set() };
	const items= rss.slice(rss.indexOf("<item>")+6, rss.lastIndexOf("</item>"))
		.split(new RegExp(`<\\/item>${b}<item>`))
		.filter(l=> l.trim())
		.map(l=> ({ ...matchGroups(item_regexp, l) }))
		.reduce(function collect(out, { title, link }){
			title= title.slice(0, title.indexOf(" ", title.lastIndexOf("#")));
			link= link.replace(links.episodes, "");
			out.set(toId(title), link);
			return out;
		}, new Map());
	return { links, lastBuildDate, items, missed };
}
function hasAudio(items, { title }){
	const id= toId(title);
	return items.has(id) ? items.get(id) : false;
}
function toId(title){ return title.toLowerCase().replace(/[^a-z0-9]/g, "");}
/** @param {string} string @param {RegExp} regexp */
function matchGroups(regexp, string){
	const m= string.match(regexp);
	if(m===null){
		echo(string);
		throw new Error(`No match: ${string.slice(0, 50)}… ${regexp}`); }
	return { ...m.groups };
}
