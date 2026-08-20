# The Crown — V6.2

The Crown has no owner until a valid signed transition is merged.

This repository is in `GENESIS_OPEN`. The presence of these files does not start the competition.

## Public protocol surface

- `.crown/crown-config.json` fixes the repository, competition, contestants, authorities and immutable verification inputs.
- `.crown/identity-registry.json` records the three contestant Identity public keys. Private keys must never be committed or shared.
- `.crown/crown-ledger.jsonl` is the append-only canonical state.
- `.crown/policy.json` is Crown-governed while the state is `CROWNED`.
- `.crown/last-war/pack-commitment.json` commits the offline challenge pack before selection.
- `.crown/protocol-root.json` identifies the verifier modules embedded in the Guard workflow.
- `.github/workflows/retirement-guard.yml` enforces `Retirement Guard / retirement-policy`.

The verifier is authoritative. Prose is only an operational summary.

## State and race rules

The ordinary sequence is:

```text
GENESIS_OPEN -> CROWNED -> LW_OPEN -> FINAL_CROWN
```

Last War START atomically publishes the selected instance, its Merkle proof and the signed ledger transition. Selection is fixed by committed public state and the accepted Genesis winner. A claim changes only the Crown ledger. The first valid claim merged against the current base wins; stale bases, replayed proofs and ledger rewrites fail.

`FINAL_CROWN` is terminal under ordinary Crown authority. Recovery is limited to an objectively invalid security floor captured by the accepted terminal transition. Later ruleset drift cannot rewrite that result.

## Last War

Each selected instance is a constraint graph. Candidate values use byte encodings, Unicode normalization, integers and canonical JSON. Local constraints leave multiple plausible assignments; the final commitment accepts one.

The offline pack, solutions and generator seed are not repository artifacts. A contestant transition always requires that contestant's registered Identity signature and a fresh Crown key.

## Safety boundary

Never push directly to `main`. Do not bypass required checks or reuse an Identity, authority, current Crown, or historical Crown key as a candidate Crown key. A competition action is a Pull Request only after the operator explicitly announces START.
