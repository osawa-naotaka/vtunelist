# VtuneList 技術スタック仕様書

## 概要

VtuneListは完全無料・サーバーレス・静的サイト生成によるVTuber楽曲リスト管理システムです。非技術者のVTuberでも簡単にセットアップ・運用できることを最重要視した技術選定を行っています。

## コア技術スタック

### 1. ウェブサイト構築フレームワーク・バンドラ: zephblaze

**バージョン**: 0.1.0-alpha.3  
**公式サイト**: [zephblaze](https://github.com/lulliecat/zephblaze)  
**ライセンス**: MIT

#### 選定理由

- **SSG（静的サイト生成）対応**: GitHub Pages完全対応で無料運用可能
- **JSON ファイル生成機能**: 楽曲データを元に生成した検索インデックスを出力するために必須
- **TypeScript + JSX**: 型安全性とコンポーネント指向開発の両立
- **開発中フレームワーク**: 本プロジェクトと同時にzephblaze自体の改良も進行
- **シンプルな設定**: 最小限の設定でプロダクション対応サイト構築
- **ファイルベースルーティング**: 直感的なページ構造

#### 主な機能

- TSX（TypeScript + JSX）による型安全なHTML生成
- ファイルベースルーティング（`site/pages/`以下）
- 開発サーバー（ホットリロード対応）
- 基本的なファイルバンドル機能
- CSS-in-JS対応
- マークダウンサポート

#### 使用例

```tsx
// site/pages/index.html.tsx
import type { HRootPageFn, Store } from "zephblaze/core";

export default function Root(_store: Store): HRootPageFn<void> {
    return async () => (
        <html lang="ja">
            <head>
                <title>VtuneList</title>
            </head>
            <body>
                <h1>楽曲リスト</h1>
            </body>
        </html>
    );
}
```

### 2. 検索ライブラリ: staticseek

**バージョン**: 最新版  
**公式サイト**: [staticseek](https://staticseek.lulliecat.com/)  
**ライセンス**: MIT

#### 選定理由

- **静的サイト特化**: サーバー不要で完全クライアントサイド動作
- **日本語・CJK文字完全対応**: VTuber楽曲の日本語タイトル検索に最適
- **高機能検索**: あいまい検索、AND/OR/NOT演算子、フィールド検索
- **軽量・高速**: ブラウザネイティブ実装でパフォーマンス最適化
- **簡単統合**: 数行のコードで実装可能
- **完全無料**: 商用利用可能でコスト不要

#### 主な機能

- **Unicode完全対応**: 日本語・CJK文字・絵文字対応
- **あいまい検索**: カスタマイズ可能な編集距離
- **高度検索演算子**: AND, OR, NOT, フィールド指定検索
- **TF-IDF スコアリング**: カスタマイズ可能な重み付け
- **Google風クエリ構文**: 直感的な検索体験
- **複数インデックス実装**: パフォーマンス要件に応じた選択
- **SSG統合**: Next.js, Astro, Nuxt等との連携

#### パフォーマンス

- **ベンチマーク結果**:
  - Intel Core i5-13400F + RTX 4070環境: 高速動作確認済み
  - Intel N100環境: 軽量端末でも実用的速度
- **メモリ効率**: インデックスサイズ最適化
- **初期化速度**: 高速インデックス構築

### 3. エラーハンドリング: NeverThrow (Result型)

**パッケージ名**: `neverthrow`  
**バージョン**: 最新安定版  
**公式**: [GitHub](https://github.com/supermacro/neverthrow)

#### 選定理由

- **型安全なエラーハンドリング**: Rust風Result型によるコンパイル時エラー検出
- **関数型プログラミング**: immutableな設計でバグ削減
- **明示的エラー処理**: try-catchより予測可能で保守しやすい
- **TypeScript親和性**: 型推論との相性が良い

#### 使用パターン

```typescript
import { Result, ok, err } from 'neverthrow';

type ParseError = 'INVALID_JSON' | 'MISSING_FIELD';

function parseConfig(data: string): Result<Config, ParseError> {
    try {
        const parsed = JSON.parse(data);
        if (!parsed.name) return err('MISSING_FIELD');
        return ok(parsed as Config);
    } catch {
        return err('INVALID_JSON');
    }
}
```

### 4. 言語: TypeScript

**バージョン**: ~5.8.3  
**設定**: 厳格モード有効

#### 選定理由

- **型安全性**: 実行時エラーの事前検出
- **開発効率**: IDEサポート、自動補完、リファクタリング支援
- **保守性**: 大規模コードベースの長期保守
- **エコシステム**: npmパッケージとの高い互換性
- **段階的導入**: 既存JavaScriptコードからの移行容易性

#### TypeScript設定（tsconfig.json）

```json
{
    "compilerOptions": {
        "target": "ES2024",
        "module": "ESNext",
        "jsx": "react-jsx",
        "jsxImportSource": "zephblaze",
        "strict": true,
        "moduleResolution": "bundler",
        "skipLibCheck": true
    }
}
```

## 開発ツール

### パッケージマネージャー: Bun (デフォルト) + Yarn対応

**デフォルト**: Bun - 高速インストール・実行、TypeScriptネイティブサポート  
**代替選択肢**: Yarn + Node.js - 幅広い環境対応、安定性重視

### リンター・フォーマッター: Biome

**パッケージ**: `@biomejs/biome`  
**理由**: 高速、ESLint + Prettierの一体型、設定最小化

### CI/CD: GitHub Actions

**理由**: GitHub無料枠内、GitHub Pages自動デプロイ、設定簡単

## デプロイ・ホスティング

### GitHub Pages

**理由**:
- **完全無料**: パブリックリポジトリで無制限
- **自動デプロイ**: Git pushで自動更新
- **CDN**: 世界中で高速配信
- **HTTPS**: 標準でSSL対応
- **カスタムドメイン**: 独自ドメイン設定可能

### デプロイフロー

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - uses: actions/deploy-pages@v3
        with:
          path: ./dist
```

## データ処理

### CSV取得・パース

**CSVライブラリ**: fast-csv  
**バージョン**: 最新安定版  
**取得**: Web Fetch API  
**理由**: ビルド時のNode.js/Bun環境でのみ使用、型安全性重視

#### fast-csv 選定理由

- **TypeScript製**: ネイティブな型サポートで開発効率向上
- **シンプルAPI**: 学習コストが低く、保守しやすい
- **十分な性能**: VtuneListのデータ規模（1000曲程度）で必要十分
- **アクティブメンテナンス**: 定期的なアップデートとバグ修正
- **同期・非同期両対応**: 柔軟な処理パターンに対応

#### ライブラリ比較

| 項目 | fast-csv | csv-parser |
|------|----------|------------|
| **型安全性** | ✅ TypeScript製 | ❌ 型定義別途必要 |
| **API簡易性** | ✅ シンプル | ❌ Streams API必要 |
| **処理速度** | ⭕ 中速（十分） | ✅ 90,000行/秒 |
| **メモリ効率** | ❌ 全データ読み込み | ✅ Stream処理 |
| **学習コスト** | ✅ 低い | ❌ 高い（Streams理解必要） |
| **適用データ規模** | ⭕ 小〜中規模 | ✅ 大規模データ |

**結論**: VtuneListのデータ規模（数MB）では型安全性と開発効率を重視してfast-csvを採用

#### 使用例

```typescript
import * as csv from 'fast-csv';
import { Result, ok, err } from 'neverthrow';

interface SongData {
    title: string;
    artist: string;
    genre: string;
}

async function parseSongsCsv(csvData: string): Promise<Result<SongData[], string>> {
    return new Promise((resolve) => {
        const songs: SongData[] = [];
        
        csv.parseString(csvData, { headers: true })
           .on('data', (row: SongData) => songs.push(row))
           .on('end', () => resolve(ok(songs)))
           .on('error', (error) => resolve(err(error.message)));
    });
}
```

### JSON変換・生成

**実装**: zephblaze組み込み機能  
**理由**: staticseek連携、型安全性、自動最適化

## セキュリティ

### 静的サイト

**メリット**: サーバー攻撃面なし、SQLインジェクション不可  
**対策**: CSP（Content Security Policy）設定

### 秘匿情報管理

**方針**: 
- パブリックリポジトリでも安全な設計
- APIキー等はGitHub Secrets使用
- 実行時秘匿情報は環境変数経由

## パフォーマンス最適化

### 静的アセット最適化

- **HTML**: 基本的な構造化のみ（minificationなし）
- **CSS**: 基本的なバンドルのみ（未使用スタイル削除なし）
- **JavaScript**: tsupに実装されている機能のみ（Tree Shaking + Minification）
- **画像**: 手動最適化（将来自動化予定）

### 検索パフォーマンス

- **インデックス最適化**: staticseekのインデックス選択
- **遅延読み込み**: 大きなデータセットの段階読み込み
- **キャッシュ戦略**: ブラウザキャッシュ最適化

## 制約・考慮事項

### 技術的制約

- **ランタイム制約**: ブラウザのみ（Node.js不要）
- **データ量制約**: GitHub Pages 1GB制限
- **リクエスト制限**: GitHub API制限（将来考慮）

### 運用制約

- **完全無料運用**: 有料サービス使用禁止
- **非技術者対応**: 技術的セットアップ最小化
- **保守簡単性**: 依存関係最小化

### パフォーマンス考慮

- **初回読み込み**: < 3秒（モバイル3G）
- **検索レスポンス**: < 20ms（staticseekによる高速検索）
- **メモリ使用量**: < 10MB（1000楽曲程度での想定）

## 将来の拡張性

### Phase 2: React SPA化

現在の静的サイトから段階的にReact SPAへ移行予定:

- **フレームワーク移行**: zephblaze → React + TypeScript
- **YouTube連携**: YouTube Data API + Player API
- **状態管理**: React Context API / Zustand

### Phase 3: 高度機能

- **複数VTuber対応**: マルチユーザー管理
- **リクエスト機能**: GitHub Issues連携
- **アクセス解析**: サードパーティサービス連携
  - Google Analytics GA4 (無料)
  - Plausible Analytics (オープンソース、プライバシー重視)
  - Umami (軽量、プライバシー重視)

**注意**: GitHub Pages自体にはアクセス解析機能なし

## 開発・運用コマンド

```bash
# 開発
bun install          # 依存関係インストール
bun run dev          # 開発サーバー起動
bun run check        # リント・フォーマット

# ビルド
bun run build        # プロダクションビルド
bun run node-build   # Node.js環境でのビルド

# その他
tsc --watch          # TypeScript監視コンパイル
zephblaze dev        # zephblaze開発サーバー
zephblaze build      # zephblaze静的サイト生成
```

## まとめ

本技術スタックは以下の要件を満たすよう設計されています：

1. **完全無料運用**: GitHub無料枠内でフル機能提供
2. **非技術者対応**: 最小限の技術知識でセットアップ・運用可能
3. **高パフォーマンス**: モバイル対応・高速検索
4. **拡張性**: 将来機能追加に対応可能な設計
5. **保守性**: 長期運用・アップデート対応

zephblazeとstaticseekの組み合わせにより、VTuber楽曲管理に最適化された軽量・高機能・無料のソリューションを実現しています。