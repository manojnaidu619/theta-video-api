const request = require('request');
const apiId = '<YOUR_API_KEY>';
const apiSecret = '<YOUR_API_SECRET>';

const getPresignedUrlAndVideoId = async () => {
  const options = {
    method: 'POST',
    url: 'https://api.thetavideoapi.com/upload',
    headers: {
      'x-tva-sa-id': apiId,
      'x-tva-sa-secret': apiSecret,
    },
  };

  const response = await promisifiedRequest(options);
  const uploads = JSON.parse(response.body).body.uploads;
  const preSignedUrl = uploads?.[0]?.presigned_url;
  const videoId = uploads?.[0]?.id;

  return { preSignedUrl, videoId };
};

const uploadVideo = async (preSignedUrl) => {
  const options = {
    method: 'PUT',
    url: preSignedUrl,
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: "microscope.mp4",
  };

  const response = await promisifiedRequest(options);
  return response;
};

const transcodeVideo = async (videoId) => {
  const options = {
    method: 'POST',
    url: 'https://api.thetavideoapi.com/video',
    headers: {
      'x-tva-sa-id': apiId,
      'x-tva-sa-secret': apiSecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'source_upload_id': `${videoId}`,
      'playback_policy': 'public',
    }),
  };

  const response = await promisifiedRequest(options);
  return response.body;
};

const promisifiedRequest = (options) => {
  return new Promise((resolve, reject) => {
    request(options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

(async () => {
  try {
    const { preSignedUrl, videoId } = await getPresignedUrlAndVideoId();
    console.log('preSignedUrl:', preSignedUrl);
    console.log('videoId:', videoId);

    const uploadResponse = await uploadVideo(preSignedUrl);
    console.log('Upload response:', uploadResponse.body);

    const transcodedVideo = await transcodeVideo(videoId);
    console.log('Transcoded video response:', transcodedVideo);
  } catch (error) {
    console.error(error);
  }
})();

