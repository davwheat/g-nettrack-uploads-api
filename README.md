# G-NetTrack Uploads API

Uses Cloudflare Workers to handle G-NetTrack log uploads.

## App setup

In the G-NetTrack app, point the upload URL to the Cloudflare Worker URL, with pathname `/upload-log`. Include a query string of `?key=UPLOAD_KEY` where `UPLOAD_KEY` is the secret key you define as a secret.

## Secrets

| Key          | Description                         |
| ------------ | ----------------------------------- |
| `UPLOAD_KEY` | Secret key to authenticate uploads. |
