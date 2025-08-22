import type { HRootPageFn } from 'zephblaze/core';
import { Store } from 'zephblaze/core';

export default function Root(_store: Store): HRootPageFn<void> {
    return async () => {
        return (
            <html>
            </html>
        );
    };
}