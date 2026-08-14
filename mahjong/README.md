# オフライン三麻 — Playable Snapshot

このブランチは、3人麻雀プロダクトを実際に起動・対局できる状態で保存する専用スナップショットです。

## 起動

リポジトリのルートで簡易HTTPサーバーを起動します。

```bash
python3 -m http.server 8000
```

ブラウザで次を開きます。

```text
http://localhost:8000/mahjong/
```

外部サービスへの接続は不要で、対局ロジック・UI・保存処理はリポジトリ内で完結します。

## 含まれる機能

- 三人麻雀の対局進行とCPU対戦
- リーチ、ロン、ツモ、ポン、チー設定、カン、抜き北、フリテン
- ドラ・役判定・点数計算・本場・供託・東風戦進行
- 牌インスタンス整合性検査と回復処理
- CPUの非公開手牌をUIへ漏らさない公開state
- SVG牌表示
- 牌譜保存、一覧、検索・絞り込み、詳細表示
- 対話型リプレイ（局/イベント移動、手牌・河・副露・抜き北・点棒推移）
- 高度統計
- 設定JSONのエクスポート/インポート
- 固定seedとデバッグ表示

## 実装構成

対局エンジンは canonical flow 系（`RoundLifecycle` / `TurnFlow` / `TurnFlowCpu` / `CallFlow` / `KanFlow` / `WinFlow` / `RecoveryFlow`）を使用しています。

現在のUIとのstate差は `src/ui/CanonicalUiAdapter.js` で吸収し、牌譜イベント差は `src/ui/ReplayViewer.js` で互換化しています。これにより、canonical側の深い対局経路と、現在の牌表示・設定・牌譜・統計UIを同時に利用できます。

旧compact engineの互換shim（`FlowCompat.js` / `GameEngine.part1–3.js`）は実行グラフから未使用であることを確認し、clean snapshotでは削除しています。実行経路はcanonical flow 1系統です。

## 牌譜互換の追加修正

ReplayViewer は canonical event を次の形まで再構築します。

- ポン/チー後に鳴かれた牌を元の河から除去
- `minkan` / `ankan` / `kakan` の `kanType`・公開状態・元プレイヤー・4枚構成を保持
- `score_settlement.changes` を流局後の点棒へ反映
- `double_ron.changes` をダブロン後の点棒へ反映

## 検証

このブランチ専用の **Mahjong Snapshot CI** は現在24系統を検証します。

- 固定seedの東風戦E2E
- Replay hardening（ポン/カン/流局精算/ダブロン）
- `mahjong/index.html` の実script順によるbrowser bootstrap
- GameEngine公開APIとcanonical flow module境界
- CPUカン→嶺上ツモ
- 山0で大明槓を禁止し、山ありでは正常に嶺上牌を取得
- Recoveryがpending CPUロン/槍槓候補を通常経路へ保持
- SVG牌表示
- 牌譜リプレイ本体とUI bootstrap
- 設定export/importとUI bootstrap
- 牌譜index検索・RecordsDashboard
- 鳴き、advanced rules、CPU/assist
- 手牌解析、integrity/recovery、match進行
- 保存、点数計算、役判定

E2Eでは TileLedger の整合性、CPU伏せ手の非公開、GameEngine主要公開API、鳴き後の牌譜再構築も検査します。

24系統完全green確認: `d6d4b12ebf2c862e5e6b9945e369550dd639d7cb`

保存点: `checkpoint/mahjong-canonical-modern-deep-ci-2026-08-15`

## main との関係

`main` には現在 Retirement Guard v6 による退役ポリシーがあり、Mahjongの実行パスを再導入しない方針が固定されています。そのため、この playable snapshot は **意図的に専用ブランチで維持**します。

リポジトリ方針が変更されない限り、このブランチを `main` へそのままマージすることは前提にしません。
