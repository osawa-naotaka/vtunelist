# VtuneList フロントエンド実装仕様書

## 1. 概要

VtuneListのフロントエンド実装を関数型プログラミング手法で設計します。検索・フィルタ・ソート機能を純粋関数として実装し、Readtによる宣言的なUI更新、Tailwind CSSによるレスポンシブデザインを実現します。

## 2. アーキテクチャ原則

### 2.1 関数型UI設計原則
- **純粋コンポーネント**: プロパティのみに依存するコンポーネント
- **単一データフロー**: トップダウンのデータ流れ
- **不変状態管理**: 状態の更新は新しいオブジェクト生成で実現
- **副作用の分離**: データ取得・ローカルストレージ操作を明確に分離

### 2.2 エラーハンドリング戦略
```typescript
import { Result, ok, err } from 'neverthrow';

// フロントエンド専用Result型
type UIResult<T> = Result<T, UIError>;

interface UIError {
  readonly type: UIErrorType;
  readonly message: string;
  readonly recoverable: boolean;
}
```

## 3. アプリケーション状態設計

### 3.1 状態型定義

```typescript
// メイン状態
interface AppState {
  readonly songs: readonly Song[];
  readonly ui: UIState;
  readonly search: SearchState;
  readonly filters: FilterState;
  readonly sort: SortState;
  readonly loading: LoadingState;
  readonly errors: readonly UIError[];
}

// UI状態
interface UIState {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly isMobileMenuOpen: boolean;
  readonly isFilterPanelOpen: boolean;
  readonly selectedSong: Song | null;
}

// 検索状態
interface SearchState {
  readonly query: string;
  readonly results: readonly Song[];
  readonly searchTime: number;
  readonly totalResults: number;
}

// フィルタ状態
interface FilterState {
  readonly selectedGenres: readonly string[];
  readonly availableGenres: readonly string[];
  readonly genreCounts: Record<string, number>;
}

// ソート状態
interface SortState {
  readonly field: SortField;
  readonly order: SortOrder;
}

type SortField = 'title' | 'artist' | 'genre';
type SortOrder = 'asc' | 'desc';

// ローディング状態
interface LoadingState {
  readonly isInitialLoading: boolean;
  readonly isSearching: boolean;
  readonly error: UIError | null;
}
```

### 3.2 状態更新戦略

**不変状態管理**: 状態の更新は新しいオブジェクト生成で実現。関数型プログラミングの原則に従い、状態更新関数は純粋関数として実装。

**コンポーネント連携**: Readtのhooksを使用した単一データフローで状態管理。

## 4. 検索・フィルタ・ソート機能実装

### 4.1 検索機能実装

```typescript
/**
 * staticseekライブラリで検索インデックスを初期化
 * @param songs - 楽曲データ配列
 * @returns 初期化済み検索エンジンまたはエラー
 */
function initializeSearch(songs: readonly Song[]): UIResult<StaticSeek<Song>>
```

**処理内容**: staticseekライブラリで検索インデックスを構築。検索対象フィールドはtitle、artist、genres、note。文字正規化とトークン化を有効化。

```typescript
/**
 * クエリ文字列で楽曲を検索しパフォーマンス測定
 * @param query - 検索クエリ文字列
 * @returns 検索結果とパフォーマンス情報
 */
function searchSongs(query: string): UIResult<SearchResult>
```

**処理内容**: 検索実行時間をperformance.now()で測定。空クエリの場合は全楽曲を返す。検索結果には検索時間とヒット数を含む。

### 4.2 フィルタ機能実装

```typescript
/**
 * 選択されたジャンルで楽曲をフィルタリング
 * @param songs - 対象楽曲配列
 * @param selectedGenres - 選択ジャンル配列
 * @returns フィルタ済み楽曲配列
 */
function filterByGenres(
  songs: readonly Song[], 
  selectedGenres: readonly string[]
): readonly Song[]
```

**処理内容**: 選択ジャンルが空の場合は全楽曲を返す。そうでない場合、楽曲のジャンルと選択ジャンルの交集がある楽曲のみを抽出。

```typescript
/**
 * 楽曲配列からジャンル情報を抽出し統計を生成
 * @param songs - 対象楽曲配列
 * @returns ジャンル一覧と統計情報
 */
function extractGenres(songs: readonly Song[]): GenreInfo
```

**処理内容**: 全楽曲からジャンルを抽出し、ジャンル別の楽曲数をカウント。ジャンル一覧は日本語ロケールでソート。

### 4.3 ソート機能実装

```typescript
/**
 * 指定されたフィールドと順序で楽曲をソート
 * @param songs - 対象楽曲配列
 * @param sortConfig - ソート設定
 * @returns ソート済み楽曲配列
 */
function sortSongs(
  songs: readonly Song[], 
  sortConfig: SortState
): readonly Song[]
```

**処理内容**: Intl.Collatorで日本語対応ソートを実装。タイトル、アーティスト、ジャンル（最初の要素）でソート可能。昇順・降順切り替え対応。

### 4.4 統合処理関数

```typescript
/**
 * 検索・フィルタ・ソートを結合したパイプライン処理
 * @param searchResult - 検索結果
 * @param filters - フィルタ設定
 * @param sort - ソート設定
 * @returns 最終的な表示用楽曲配列
 */
function processUserFilters(
  searchResult: SearchResult,
  filters: FilterState,
  sort: SortState
): readonly Song[]
```

**処理内容**: 関数合成パターンで、検索結果にフィルタとソートを順次適用。

## 5. コンポーネント設計

### 5.1 メインアプリケーションコンポーネント

```typescript
/**
 * メインアプリケーションコンポーネント
 * @param initialData - 初期楽曲データ（任意）
 * @returns メインアプリケーションJSX要素
 */
function App({ initialData }: { initialData?: SongsData }): JSX.Element
```

**処理内容**: 
- 初期データがない場合はsongs.jsonを取得
- 検索エンジンの初期化
- 状態管理とイベントハンドラー
- シングルカラムレイアウト

### 5.2 検索ボックスコンポーネント

```typescript
/**
 * リアルタイム検索入力コンポーネント
 * @param query - 現在の検索クエリ
 * @param onSearch - 検索実行コールバック
 * @param isSearching - 検索中フラグ
 * @returns 検索ボックスJSX要素
 */
function SearchBox({
  query, 
  onSearch, 
  isSearching 
}: SearchBoxProps): JSX.Element
```

**処理内容**: 
- 300msデバウンス処理でリアルタイム検索
- 検索中はスピナー表示
- 検索クリアボタン
- ダークモード対応スタイリング

### 5.3 フィルタパネルコンポーネント

```typescript
/**
 * ジャンルフィルタリングパネルコンポーネント
 * @param filters - フィルタ状態
 * @param onGenreToggle - ジャンル選択切り替えコールバック
 * @returns フィルタパネルJSX要素
 */
function FilterPanel({ filters, onGenreToggle }: FilterPanelProps): JSX.Element
```

**処理内容**: 
- ジャンル一覧をチェックボックス形式で表示
- 各ジャンルに楽曲数バッジを表示
- 「すべて選択」・「すべて解除」ボタン
- スクロール可能なリスト（最大96px制限）

### 5.4 楽曲リストコンポーネント

```typescript
/**
 * 検索結果とパフォーマンス情報を表示するコンポーネント
 * @param songs - 表示対象楽曲配列
 * @param searchTime - 検索実行時間(ミリ秒)
 * @param totalResults - 総ヒット数
 * @returns 検索結果リストJSX要素
 */
function SearchResults({
  songs, 
  searchTime, 
  totalResults 
}: SearchResultsProps): JSX.Element
```

**処理内容**: 
- 検索時間とヒット数の表示
- 楽曲カードのリスト表示
- 検索結果が空の場合のメッセージ表示
- テスト用のdata-testid属性

### 5.5 楽曲カードコンポーネント

```typescript
/**
 * 個別楽曲情報を表示するカードコンポーネント
 * @param song - 表示する楽曲データ
 * @returns 楽曲カードJSX要素
 */
function SongCard({ song }: SongCardProps): JSX.Element
```

**処理内容**: 
- 楽曲名、アーティスト名、メモの表示
- ジャンルタグの表示（色分けバッジ）
- レスポンシブレイアウト（モバイルでは縦積み）
- ホバーエフェクトとダークモード対応
- 将来の機能拡張用アクションボタン

## 6. ローカルストレージ管理

### 6.1 設定永続化

```typescript
/**
 * ブラウザローカルストレージからユーザー設定を読み込み
 * @returns 設定データまたはデフォルト値
 */
function loadSettings(): UIResult<StoredSettings>
```

**処理内容**: localStorageから'vtunelist-settings'キーでデータを取得。存在しない場合はデフォルト設定を返す。JSONパースエラー時はResult型でエラーを返す。

```typescript
/**
 * ユーザー設定をローカルストレージに保存
 * @param settings - 保存する設定データ
 * @returns 成功またはエラー
 */
function saveSettings(settings: StoredSettings): UIResult<void>
```

**処理内容**: 設定データをJSON文字列化してlocalStorageに保存。QuotaExceededErrorなどのストレージエラーをハンドリング。

```typescript
/**
 * 検索履歴に新しいクエリを追加し重複を除去
 * @param query - 追加する検索クエリ
 * @param currentHistory - 現在の検索履歴
 * @returns 更新された検索履歴（最大10件）
 */
function addToSearchHistory(
  query: string, 
  currentHistory: readonly string[]
): readonly string[]
```

**処理内容**: 重複するクエリを削除し、新しいクエリを先頭に追加。履歴の上限は10件。

## 7. エラーハンドリング戦略

### 7.1 エラー表示コンポーネント

```typescript
/**
 * エラー通知をトースト形式で表示するコンポーネント
 * @param errors - 表示するエラー配列
 * @param onDismiss - エラー除去コールバック
 * @returns エラー通知JSX要素
 */
function ErrorNotification({
  errors, 
  onDismiss 
}: ErrorNotificationProps): JSX.Element
```

**処理内容**: 
- 回復可能エラー：黄色系トースト
- 重大エラー：赤色系トースト
- 右下固定位置、z-index 50で最前面表示
- 手動閉じるボタン付き

### 7.2 ローディング状態表示

```typescript
/**
 * シンプルなスピナーコンポーネント
 * @returns スピナーJSX要素
 */
function LoadingSpinner(): JSX.Element
```

**処理内容**: CSSアニメーションで回転するスピナー。Tailwind CSSのanimate-spinクラスを使用。

```typescript
/**
 * フルスクリーンローディングオーバーレイ
 * @param isLoading - ローディング状態
 * @param message - 表示メッセージ
 * @returns ローディングオーバーレイJSX要素またはnull
 */
function LoadingOverlay({
  isLoading, 
  message 
}: LoadingOverlayProps): JSX.Element | null
```

**処理内容**: グレーオーバーレイで全画面を覆い、中央にスピナーとメッセージを表示。isLoadingがfalseの場合はnullを返す。

## 8. デザイン

### 8.1 CSS設定

**カスタムカラー**:
- vtune-blue: #3B82F6
- vtune-purple: #8B5CF6

**ダークモード**: classベースで切り替え

### 8.2 レイアウト戦略

**シングルカラムレイアウト**: デスクトップとモバイル両方で単一カラムレイアウトを使用

**コンテンツ幅**: 最大768pxで中央配置

