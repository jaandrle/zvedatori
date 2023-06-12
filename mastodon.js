/** @param {{ url: string, token: script, status: string }} def */
export async function post({ url, token, status }){
	return fetch(new URL("api/v1/statuses", url), {
		method: "POST",
		headers: {
			Authorization: "Bearer "+token,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ status, visibility: "public" })
	}).then(res=> res.json());
}
