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

## 検証

このブランチ専用の **Mahjong Snapshot CI** が以下を自動検証します。

- 固定seedの東風戦が最後まで終了すること
- TileLedger の整合性が保たれること
- CPUの伏せ手が公開stateへ漏れないこと
- GameEngine の主要公開APIが存在すること
- 鳴き後の牌譜リプレイで、鳴かれた牌が河から正しく除去されること
- `mahjong/index.html` の実際のscript順でブラウザbootstrapが成立すること

最初の完全green確認: `fa42e1f83a3f0c1e4e453ec2440e780315076330`

## main との関係

`main` には現在 Retirement Guard v6 による退役ポリシーがあり、Mahjongの実行パスを再導入しない方針が固定されています。そのため、この playable snapshot は **意図的に専用ブランチで維持**します。

リポジトリ方針が変更されない限り、このブランチを `main` へそのままマージすることは前提にしません。
