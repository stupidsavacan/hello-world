# Mahjong application

This directory is the self-contained three-player mahjong product reconstructed from the supplied reference application.

The repository's top-level `src/game` tree is treated as legacy/in-progress shared state because current `main` has intentionally retired parts of it. New mahjong functionality is therefore integrated here without restoring or overwriting those deletions.

Implementation is added incrementally through dependency-ordered pull requests. The reference ZIP itself and its archive clutter are not committed here.
