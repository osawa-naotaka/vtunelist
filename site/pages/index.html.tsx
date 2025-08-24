import { page } from "@site/components/pages/page";
import { DEFAULT_RESPONSIVE_PAGE_WIDTH, element, registerRootPage, style } from "zephblaze/core";
import type { HRootPageFn, Store } from "zephblaze/core";

export default function Root(store: Store): HRootPageFn<void> {
    const Page = page(store);
    const PageMainArea = element("page-main-area", { tag: "main" });

    const styles = [style(PageMainArea)(DEFAULT_RESPONSIVE_PAGE_WIDTH(store))];

    registerRootPage(store, styles);

    return async () => {

        return (
            <Page title="vtunelinst" description="vtunelist testpage" lang="ja">
                <PageMainArea>
                </PageMainArea>
            </Page>
        );
    };
}
