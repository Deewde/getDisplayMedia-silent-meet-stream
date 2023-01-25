var activeStream;
var mediaRecorder;

window.addEventListener("load", () => {
	runOnStart();
});

function runOnStart() {
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		switch (message.type) {
			case 'startChain':
				startRecording();
				break;
			case 'stopChain':
				mediaRecorder.stop();
				activeStream.getTracks().forEach((track) => track.stop());
				break;
		}
	});
}

function startRecording() {
	const dmOptions = {
		video: true,
		audio: true,
		preferCurrentTab: true
	}
	
	navigator.mediaDevices.getDisplayMedia(dmOptions).then((stream) => {
		activeStream = stream;
		
		chrome.runtime.sendMessage({type: 'started', streamId: stream.id});
		
		mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
		
		mediaRecorder.ondataavailable = function(e) {
			download(new Blob([e.data]));
		};
		
		mediaRecorder.start();
		
	}).catch((err) => {
		console.error('streamError', err);
	});
}

function download(blob) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	
	a.style = "display: none";
	a.href = url;
	a.download = "test.webm";
	
	document.body.appendChild(a);
	a.click();
	window.URL.revokeObjectURL(url);
}