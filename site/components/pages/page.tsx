import { pageHead } from "@site/components/pages/pageHead";
import { component, registerComponent } from "zephblaze/core";
import type { HComponentFn, Store } from "zephblaze/core";
import { DEFAULT_STYLES, INIT_CSS } from "zephblaze/core";

export type PageArgument = {
    title: string;
    description: string;
    lang: string;
};

export function page(store: Store): HComponentFn<PageArgument> {
    const PageHead = pageHead();

    const styles = [INIT_CSS, DEFAULT_STYLES(store)];

    registerComponent(store, "html", styles);

    return component("html", ({ lang, title, description }, ...child) => (
        <html lang={lang}>
            <PageHead title={title} description={description} url={new URL("https://vtunelist.cc/")}/>
            <body>
                {child}
            </body>
        </html>
    ));
}
