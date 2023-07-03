#!/usr/bin/env -S npx nodejsscript
/* jshint esversion: 11,-W097, -W040, module: true, node: true, expr: true, undef: true *//* global echo, $, pipe, s, fetch, cyclicLoop */
const id= "UCjCUIQbZi3JSfANE6tyCCog";
let key= "";
const url_api= "https://youtube.googleapis.com/youtube/v3/";
const options_fetch= { headers: { Accept: "application/json" }, compress: true };
import { env_names, data_file, gitCommit } from "./common.js";
/**
 * ID a počet videí v playlistu
 * @typedef Playlist
 * @type {{ id: string, length: number }}
 * */

$.api("", true)
.version("0.2.0")
.describe([
	"Pomocný script k uložení informací o YT videích na kanálu @Zvědátoři.",
	"Data jsou uložena jako JSON v souboru: "+data_file,
	"",
	"Videa jsou řazena od posledního, při spuštění scriptu se jen doplní chybějící",
	"a tedy script se znovu nedotazuje na již zaznamenaná videa."
])
.option("--token", "Youtube API token – povinný")
.option("--force", "Vynutí stažení všech záznamů")
.action(async function main({
	token= $.env[env_names.youtube.token],
	force
}){
	if(!token) $.error(`Can't access YT API without a token, please use the '--token' option or enviroment variable '${env_names.youtube.token}'.`);
	key= token;

	const playlist= await fetchPlaylist(id);
	const data= force ? [] : s.cat(data_file).xargs(JSON.parse);
	const { id: limitID }= data[0] || {};
	const data_tmp= [];
	const todo= ()=> playlist.length - data.length - data_tmp.length;
	for await (const video of fetchVideos(playlist)) {
		echo.use("-R", "Todo: "+todo());
		if(limitID===video.id) break;
		data_tmp.push(video);
	}
	echo("Videos collected");
	s.echo(JSON.stringify(data_tmp.concat(data), null, "\t")).to(data_file);
	if(!force) gitCommit(data_file, "crawler");
	echo("Done");
	$.exit(0);
})
.parse();

/** @param {Playlist} playlist */
async function* fetchVideos({ id, length }){
	const maxResults= 50;
	let i= 0, page_l= 0, page;
	while(i<length){
		if(!(i%50)){
			if(page) page_l+= page.pageInfo.resultsPerPage;
			page= await fetchVideosPage({ playlistId: id, pageToken: page?.nextPageToken, maxResults });
		}
		const index= i - page_l;
		const { publishedAt, title, description, resourceId }= page.items[index].snippet;
		yield {
			id: resourceId.videoId,
			title,
			description: parseDescription(description),
			date: publishedAt
		};
		i+= 1;
	}
}
function parseDescription(candidate){//TODO try better backup
	if(candidate.includes("Originální pokec pochází z dílu")){
		return [ candidate.slice(0, candidate.indexOf("\n")).trim() ];
	}
	if(candidate.includes("CO BY KDYBY")){
		candidate= candidate.slice(candidate.lastIndexOf("\nCO BY KDYBY")+1);
		return [ candidate.slice(0, candidate.indexOf("\n")).trim() ];
	}
	if(!candidate.includes("Zdroje"))
		return [];
	
	candidate= candidate.slice(candidate.lastIndexOf("\nZdroje")+1).trim()
		.split("\n").slice(1).filter(Boolean);
	return [ "Zdroje/Inspirováno:" ].concat(candidate);
}
async function fetchVideosPage({ playlistId, pageToken, maxResults }){
	const url= url_api+"playlistItems"+params({
		part: "snippet",
		fields: [ "nextPageToken", "pageInfo.resultsPerPage", "items.snippet.publishedAt", "items.snippet.title", "items.snippet.description", "items.snippet.resourceId.videoId" ],
		pageToken, maxResults, playlistId, key
	});
	return fetch(url, options_fetch)
		.then(response => response.json());
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
				length: Number(statistics.videoCount) + 4 //some videos are not reported (hidden?)
			})
		));
}

function params(o){
	const out= new URLSearchParams();
	Object.entries(o)
		.forEach(([ name, value ])=> typeof value !== "undefined" && out.append(name, value));
	return "?"+out.toString();
}
