# The Crown

The Crown has no owner.

The first Crown remembers only the last gate of V6.

After the first coronation, twenty witnesses remember the road.

The first valid usurpation closes the road behind it.

## Ground rules

This is a repository-local contest protocol, not a GitHub authentication system. Never publish an Identity private key, Crown private key, challenge seed, or PKCS#8 material. Work on a branch and use a Pull Request; do not change `main` directly.

The immutable verifier is `.github/workflows/retirement-guard.yml`. Its required status is `Retirement Guard / retirement-policy`. The immutable parameters and expected challenge public keys are in `.crown/crown-config.json`. The complete state is the append-only `.crown/crown-ledger.jsonl`.

All byte strings below are UTF-8. All hashes are lowercase SHA-256 hex unless a Git object is explicitly a 40-character SHA-1. Indexes are zero-based. Hex is parsed unsigned. Normalize text line endings from CRLF or CR to LF before splitting. A final LF therefore produces a final empty element when `split("\n")` is used.

## The First Crown — five gates

Use the public repository `stupidsavacan/hello-world` and pin final V6 commit `69e3dc7244df54813fa93a7ca3a0807536111618` as `commit`.

1. Read that commit's tree SHA as `tree`.
2. Read the Git blob SHA of `.retirement/retired-paths.json` as `anchor_blob`.
3. Read the Git blob SHA of `.github/workflows/retirement-guard.yml` as `guard_blob`.
4. Normalize `.retirement/retirement-ledger.jsonl` to LF and discard empty lines. There must be exactly 179 remaining lines.
5. Hash the exact UTF-8 bytes of the final remaining line as `final_ledger_line_sha256`, then construct `W` exactly, including its final LF:

```text
commit=<commit>
tree=<tree>
anchor_blob=<anchor_blob>
guard_blob=<guard_blob>
final_ledger_line_sha256=<final_ledger_line_sha256>
```

Derive:

```text
seed = SHA256(UTF8("HELLO-WORLD/GENESIS/2\n" || W))
```

Interpret the 32-byte digest as the seed of an Ed25519 PKCS#8 private key by prefixing these DER bytes:

```text
302e020100300506032b657004220420
```

The corresponding DER SPKI public key, encoded as canonical Base64, must equal `genesis.publicKeySpkiBase64` in `.crown/crown-config.json`.

Do not use this challenge key as the Crown key. Generate a fresh Ed25519 Crown keypair and keep its private key locally.

## The Last War — twenty witnesses

This route opens only after a valid Genesis claim has been merged. It derives the single `LAST-WAR-2` challenge key.

For candidate text files, recursively enumerate Git tree entries whose mode is `100644` or `100755`, type is `blob`, size is at most 1 MiB, and path matches this case-insensitive extension expression:

```regex
\.(?:md|txt|json|ya?ml|toml|xml|gradle|kts?|java|js|ts|css|html|properties|pro|gitignore)$
```

Sort candidates by raw UTF-8 path bytes (`Buffer.compare(Buffer.from(path, "utf8"))`). Do not use API or search-result order.

1. Pin `stupidsavacan/hello-world` commit `69e3dc7244df54813fa93a7ca3a0807536111618` as the baseline.
2. Read the baseline tree SHA as `a1`.
3. Read the baseline Git blob SHA of `.retirement/retired-paths.json` as `a2`.
4. Compute `selector_b = SHA256(UTF8("a1=<a1>\na2=<a2>\n"))`.
5. Enumerate merged Pull Requests in `stupidsavacan/hello-world` whose PR number is at most `234` and whose `mergeCommit.oid` is present.
6. Sort those PRs by ascending numeric PR number.
7. Select PR `uint32(selector_b[0..8], 16) % prCount` as PR B.
8. Record PR B's full `mergeCommit.oid` as `b1`.
9. Read the tree at `b1`.
10. Enumerate and sort its candidate text files by the rule above.
11. Select candidate `uint32(selector_b[8..16], 16) % candidateCount` and record its Git blob SHA as `b2`.
12. Compute `selector_c = SHA256(UTF8("b1=<b1>\nb2=<b2>\n"))`.
13. Remove PR B from the sorted PR candidates.
14. Select PR `uint32(selector_c[0..8], 16) % remainingPrCount` as PR C.
15. Record PR C's full `mergeCommit.oid` as `c_commit`.
16. Read the tree at `c_commit` as `c_tree`.
17. Enumerate and sort its candidate text files by the rule above.
18. Select candidate `uint32(last 8 hex of selector_c, 16) % candidateCount` and record its Git blob SHA as `c_blob`.
19. Construct `W` exactly, including its final LF:

```text
a1=<a1>
a2=<a2>
b1=<b1>
b2=<b2>
c_commit=<c_commit>
c_tree=<c_tree>
c_blob=<c_blob>
```

20. Derive the key:

```text
seed = SHA256(UTF8("HELLO-WORLD/USURPATION/2\n" || W))
```

Restore Ed25519 from the seed using the same PKCS#8 prefix. Its canonical DER SPKI Base64 must equal `usurpation.publicKeySpkiBase64` in the immutable config.

## Canonical Crown ledger

The ledger is UTF-8 without BOM, LF-only, one compact JSON object per line, no blank lines, and a mandatory final LF. A claim PR appends exactly one line and changes no other file. Past bytes must not be reserialized.

Keys must occur in exactly the shown order; unknown, missing, or reordered keys fail:

```text
INIT:
type,sequence,crownEpoch,phase,configDigest

GENESIS_CLAIM:
type,sequence,crownEpoch,claimantId,challengeId,candidatePublicKey,baseSha,previousLedgerDigest,transitionDigest,challengeProof,identityProof

CROWN_ACTION:
type,sequence,crownEpoch,holderId,operation,scope,baseSha,previousLedgerDigest,transitionDigest,crownProof

USURP_CLAIM:
type,sequence,crownEpoch,claimantId,challengeId,oldHolderId,oldCrownPublicKeyDigest,candidatePublicKey,baseSha,previousLedgerDigest,transitionDigest,challengeProof,identityProof

ARM_FINAL_README_ONLY:
type,sequence,crownEpoch,holderId,operation,baseSha,previousLedgerDigest,readmeBlobSha,targetTreeSha,transitionDigest,crownProof
```

`previousLedgerDigest` is SHA-256 of the complete base ledger raw bytes. `baseSha` is the PR's current base commit. `candidatePublicKey` is canonical Base64 of a fresh Ed25519 DER SPKI key.

`transitionDigest` is SHA-256 of compact `JSON.stringify` over only these ordered prefixes:

```text
GENESIS_CLAIM: first 8 keys through previousLedgerDigest
CROWN_ACTION: first 8 keys through previousLedgerDigest
USURP_CLAIM: first 10 keys through previousLedgerDigest
ARM_FINAL_README_ONLY: first 9 keys through targetTreeSha
```

## Signature payload

Build an exact LF-terminated payload. Angle brackets are replaced by values and are not retained. A Genesis claim uses:

```text
HELLO-WORLD/CROWN/1
repo=stupidsavacan/hello-world
kind=GENESIS_CLAIM
challenge=GENESIS-2
claimant_id=<claimantId>
expected_sequence=<sequence - 1>
expected_crown_epoch=<crownEpoch - 1>
base_sha=<baseSha>
previous_crown_ledger_sha256=<previousLedgerDigest>
candidate_spki_sha256=<SHA256(candidate SPKI DER)>
transition_sha256=<transitionDigest>
```

An usurpation claim uses:

```text
HELLO-WORLD/CROWN/1
repo=stupidsavacan/hello-world
kind=USURP_CLAIM
challenge=LAST-WAR-2
claimant_id=<claimantId>
expected_sequence=<sequence - 1>
expected_crown_epoch=<crownEpoch - 1>
base_sha=<baseSha>
previous_crown_ledger_sha256=<previousLedgerDigest>
old_holder_id=<oldHolderId>
old_crown_spki_sha256=<oldCrownPublicKeyDigest>
candidate_spki_sha256=<SHA256(candidate SPKI DER)>
transition_sha256=<transitionDigest>
```

A Crown action uses the common first three lines with `kind=CROWN_ACTION`, followed in order by `holder_id`, `expected_sequence`, `expected_crown_epoch` (equal to the entry epoch), `base_sha`, `previous_crown_ledger_sha256`, `operation`, `scope`, and `transition_sha256`. Arming uses `kind=ARM_FINAL_README_ONLY` and the same order except that `readme_blob_sha` and `target_tree_sha` follow `operation`, with no `scope` line.

For `GENESIS_CLAIM`, the prior sequence and epoch are both `0`; sign the identical payload with the Genesis challenge private key and your registered Identity private key. Store the canonical Base64 64-byte signatures as `challengeProof` and `identityProof`.

For `USURP_CLAIM`, replay the ledger first. The claimant must be a registered contestant other than the current holder. Set the new epoch to prior epoch + 1, bind the current holder and SHA-256 of the current Crown SPKI DER, then sign the identical payload with the Last War challenge key and the claimant's Identity key.

The candidate Crown key must be fresh. Reuse of any challenge key, Identity key, or current Crown key is rejected.

## Crown actions and ending

The current Crown can sign `ACTIVATE_SCOPE` or `DEACTIVATE_SCOPE` for `mahjong` or `loopdeck`. Protected witnesses and `.crown`, `.retirement`, and Guard infrastructure remain immutable.

After a successful usurpation the phase is `FINAL_CROWN`. The final holder may sign `ARM_FINAL_README_ONLY`, binding the existing README blob and the exact intended README-only Git tree. A separate next PR must then produce exactly that armed tree. This ending is irreversible without repository-admin maintenance.

## Race semantics

Genesis and Last War are each one-shot transitions. Strict required checks bind each proof to the current base, sequence, epoch, ledger digest, claimant, and candidate Crown key. If another valid claim merges first, update your branch and rebuild every bound field and signature; a consumed transition cannot be replayed.
