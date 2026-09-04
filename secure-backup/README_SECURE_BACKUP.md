# Duta QU secure source backup

This branch contains a sanitized source backup encrypted in **10 authenticated layers**.
It is intentionally not plaintext source and does not replace the deployable source used by cPanel/Vercel.

## Files

- `web-dutaqu-source-10-layer.enc` — ciphertext
- `web-dutaqu-source-10-layer.manifest.json` — algorithms, nonces, AAD, hashes, and recipient key wraps
- `web-dutaqu-source-sanitized.tar.gz` — sanitized archive encrypted by the ciphertext; retained here only as a hash/reference artifact and is not the deployable copy

## Security

- 10 authenticated encryption layers: AES-256-GCM, ChaCha20-Poly1305, and XChaCha20-Poly1305.
- Each layer key is sealed separately for the two public SSH keys currently published by GitHub user `Kavleri`.
- No `.env`, password, token, database connection string, fallback database, or private key is included.
- Verify SHA-512 values against the manifest before decrypting.

The branch is a backup artifact only; the repository `main` branches and live deployments are not replaced.
