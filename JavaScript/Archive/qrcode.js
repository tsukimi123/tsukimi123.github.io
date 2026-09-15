
			const video = document.getElementById('videoElement');
			const resultDiv = document.getElementById('result');
			var qrcode = new QRCode(document.getElementById("qrcode"), { width: 384, height: 384,});
			
			var lTime = new Date();
			var lTimeString = lTime.toLocaleString('en-US', { timeZone: 'Asia/Taipei' });
			var qrCodeData = "Page loaded Time is : " + lTimeString;	
			qrcode.makeCode(qrCodeData);
			
			function startCamera() {
				navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
				.then(stream => {
				video.srcObject = stream;
				}).catch(error => {
				console.error('Error accessing camera:', error);
				});
			}
			
			function scanQRCode() {
				const canvas = document.createElement('canvas');
				const context = canvas.getContext('2d');
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				context.drawImage(video, 0, 0, canvas.width, canvas.height);
				
				const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
				const code = jsQR(imageData.data, imageData.width, imageData.height);
				
				if (code) {
					console.log('QR Code detected:', code.data);
					resultDiv.innerText = 'Qrcode內容: ' + code.data;
				}else {
					resultDiv.innerText = '沒有偵測到Qrcode';
				}
				
				requestAnimationFrame(scanQRCode);
			}
			video.addEventListener('canplay', () => {
				requestAnimationFrame(scanQRCode);
			});
		