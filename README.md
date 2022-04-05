# Algorand.dev

This is a complete rewrite of the original Algorand.dev project.

## Lessons Learned

### #1

`algosdk` doesn't play nice with `create-react-app` because `react-scripts v5.0.0` uses Webpack 5 which doesn't polyfill `crypto` and other Node packages.

Change your `react-scripts` dependency to `^4.0.0`.

```json
"dependencies": {
  "react-scripts": "^4.0.0"
}
```

[source][1]

### #2

While in development (localhost) WalletConnect won't work without a **https** connection.

Two step fix, first generate a certificate.

1. Install `mkcert` on your operating system – [instructions](https://github.com/FiloSottile/mkcert#installation).
2. `$ mkcert -install` – generate a local certificate authority.
3. `$ mkcert localhost` – generate a certificate (if you want local network access, use host IP within local network, I.e. `192.168.X.X`).
4. `$ mkdir certificates` – create folder to store certificate files (not part of code repository).
5. `$ mv localhost* certificates/` – move them there.

Then add two environment variables to start using your certificates locally.

```sh
HTTPS=true
SSL_CRT_FILE=certificates/192.168.X.X.pem
SSL_KEY_FILE=certificates/192.168.X.X-key.pem
```

You can add environment variables to your `package.json` by modifying your `start` script to `"start": "HTTPS=true ...`.

[source][2]

[1]: https://github.com/facebook/create-react-app/issues/11756#issuecomment-1083271257
[2]: https://create-react-app.dev/docs/using-https-in-development/