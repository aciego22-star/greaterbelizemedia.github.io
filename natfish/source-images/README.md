# Source images

The full-resolution files the client delivered, kept exactly as they arrived.

`tools/process-gallery-additions.py` reads this folder and writes the web
derivatives into `assets/img/gallery/`. Nothing here is served: the deployment
package copies only `assets/`, so these stay in the repository and out of every
build.

They are kept so a derivative can be regenerated at a different size or quality
without going back to the client, and so the originals are not lost when a
scratch directory is cleared.

    python3 tools/process-gallery-additions.py source-images/gallery

Earlier deliveries that predate this folder were processed from their delivery
folders and their originals are not held here. The hero pairs, the products
recreations and the first supplied gallery set are in that group.
