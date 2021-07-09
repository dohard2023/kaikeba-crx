chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'launch') {
		try {
			const _ele = document.createElement('textarea');
			_ele.textContent = request.text;
			const body = document.getElementsByTagName('body')[0];
			body.appendChild(_ele);
			_ele.select();
			document.execCommand('copy');
			body.removeChild(_ele);
			sendResponse(true)
		} catch (error) {
			sendResponse(false)

		}
	}
});
